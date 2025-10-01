#!/usr/bin/env node

/**
 * Script de migración de imágenes locales a AWS S3
 * Usa las imágenes montadas en /images dentro del contenedor Docker
 */

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');

// Configuración
const LOCAL_IMAGES_DIR = '/images'; // Montado desde /mnt/c/Coding/ProdsIMGS
const DB_CONNECTION = 'postgresql://user:password@db:5432/entrepeques_dev';
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'pequetienda';
const S3_REGION = process.env.AWS_REGION || 'us-east-2';

// Cliente S3
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Pool de base de datos
const pool = new Pool({ connectionString: DB_CONNECTION });

/**
 * Busca archivo local basándose en la URL de WordPress
 * Prioriza imágenes originales sobre variaciones de tamaño
 */
async function findLocalFile(wpUrl, inventoryId) {
  // Extraer información de la URL
  // Ejemplo: https://entrepeques.mx/wp-content/uploads/2025/01/ACAP30-scaled.jpg
  const fileName = wpUrl.split('/').pop();
  const dateMatch = wpUrl.match(/\/uploads\/(\d{4})\/(\d{2})\//);

  // Limpiar nombre del archivo para obtener el base
  const baseFileName = fileName
    .replace(/-scaled/, '')
    .replace(/-\d+x\d+/, '')
    .replace(/\.\w+$/, ''); // Remover extensión

  // Extraer extensión original
  const extMatch = fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  const extension = extMatch ? extMatch[1].toLowerCase() : 'jpg';

  // Posibles ubicaciones del archivo
  const searchPaths = [];

  if (dateMatch) {
    const [_, year, month] = dateMatch;
    // Buscar primero en carpeta año/mes específica
    searchPaths.push(path.join(LOCAL_IMAGES_DIR, year, month));

    // Si no encuentra, buscar en todos los meses del año
    try {
      const yearPath = path.join(LOCAL_IMAGES_DIR, year);
      const months = await fs.readdir(yearPath);
      for (const m of months) {
        if (m !== month && /^\d{2}$/.test(m)) {
          searchPaths.push(path.join(LOCAL_IMAGES_DIR, year, m));
        }
      }
    } catch (e) {
      // Año no existe
    }
  }

  // También buscar en la raíz
  searchPaths.push(LOCAL_IMAGES_DIR);

  // Buscar el archivo
  for (const searchPath of searchPaths) {
    try {
      const files = await fs.readdir(searchPath);

      // PRIORIDAD 1: Buscar imagen original (sin sufijos de tamaño)
      const originalPattern = new RegExp(`^${baseFileName}(-\\d+)?\\.(jpg|jpeg|png|webp|gif)$`, 'i');
      for (const file of files) {
        // Verificar que NO tenga sufijos de tamaño (como -100x100)
        if (!file.includes('x') && originalPattern.test(file)) {
          console.log(`    📎 Usando original: ${file}`);
          return path.join(searchPath, file);
        }
      }

      // PRIORIDAD 2: Si no hay original, buscar la versión más grande
      const sizedVersions = files
        .filter(f => f.startsWith(baseFileName) && f.includes('x'))
        .map(f => {
          const sizeMatch = f.match(/-(\d+)x(\d+)/);
          return {
            file: f,
            width: sizeMatch ? parseInt(sizeMatch[1]) : 0,
            height: sizeMatch ? parseInt(sizeMatch[2]) : 0
          };
        })
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));

      if (sizedVersions.length > 0) {
        const largest = sizedVersions[0];
        console.log(`    📐 Usando versión más grande: ${largest.file} (${largest.width}x${largest.height})`);
        return path.join(searchPath, largest.file);
      }

      // PRIORIDAD 3: Cualquier archivo que coincida con el nombre base
      for (const file of files) {
        if (file.startsWith(baseFileName)) {
          console.log(`    📄 Usando coincidencia parcial: ${file}`);
          return path.join(searchPath, file);
        }
      }

    } catch (error) {
      // Directorio no existe, continuar
    }
  }

  return null;
}

/**
 * Procesa y optimiza imagen
 */
async function processImage(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath);

    // Optimizar imagen principal
    const optimized = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    return optimized;
  } catch (error) {
    console.error(`  Error procesando imagen: ${error.message}`);
    // Retornar imagen original si falla el procesamiento
    return await fs.readFile(imagePath);
  }
}

/**
 * Sube imagen a S3
 */
async function uploadToS3(buffer, inventoryId, index = 0) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const uniqueId = crypto.randomUUID().substring(0, 8);

  const key = `products/${year}/${month}/${inventoryId}_${timestamp}_${uniqueId}.jpg`;

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'max-age=31536000'
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

/**
 * Procesa un producto
 */
async function processProduct(product, options = {}) {
  const { dryRun = false } = options;

  console.log(`\n📦 ${product.inventory_id}`);

  // Verificar si ya está en S3
  if (product.images.some(url => url.includes('amazonaws.com'))) {
    console.log(`  ⏭️  Ya en S3`);
    return { skipped: true };
  }

  const newUrls = [];
  let successCount = 0;
  let errorCount = 0;

  // Procesar cada imagen
  for (let i = 0; i < product.images.length; i++) {
    const wpUrl = product.images[i];
    const fileName = wpUrl.split('/').pop();

    try {
      // Buscar archivo local
      const localPath = await findLocalFile(wpUrl, product.inventory_id);

      if (!localPath) {
        console.log(`  ❌ No encontrado: ${fileName}`);
        newUrls.push(wpUrl); // Mantener URL original
        errorCount++;
        continue;
      }

      console.log(`  ✓ Encontrado: ${path.basename(localPath)}`);

      if (dryRun) {
        console.log(`    [DRY RUN] Se subiría a S3`);
        newUrls.push(`https://s3-test/${product.inventory_id}_${i}.jpg`);
        successCount++;
        continue;
      }

      // Procesar y subir
      const processedImage = await processImage(localPath);
      const s3Url = await uploadToS3(processedImage, product.inventory_id, i);

      console.log(`    ✓ Subido a S3`);
      newUrls.push(s3Url);
      successCount++;

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      newUrls.push(wpUrl); // Mantener URL original
      errorCount++;
    }
  }

  // Actualizar base de datos
  if (!dryRun && successCount > 0) {
    await pool.query(
      'UPDATE valuation_items SET images = $1 WHERE id = $2',
      [JSON.stringify(newUrls), product.valuation_item_id]
    );
    console.log(`  💾 BD actualizada (${successCount} imágenes)`);
  }

  return {
    success: successCount > 0,
    successCount,
    errorCount,
    skipped: false
  };
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1])
    : 5;
  const all = args.includes('--all');

  console.log('='.repeat(70));
  console.log('🚀 MIGRACIÓN DE IMÁGENES A AWS S3');
  console.log('='.repeat(70));
  console.log(`📁 Directorio: ${LOCAL_IMAGES_DIR}`);
  console.log(`☁️  Bucket: ${S3_BUCKET}`);
  console.log(`🌎 Región: ${S3_REGION}`);
  console.log(`🔄 Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log(`📦 Límite: ${all ? 'TODOS' : limit + ' productos'}`);
  console.log('='.repeat(70));

  const client = await pool.connect();

  try {
    // Verificar acceso a imágenes
    try {
      const files = await fs.readdir(LOCAL_IMAGES_DIR);
      console.log(`\n✅ Directorio de imágenes OK (${files.length} elementos)\n`);
    } catch (error) {
      console.error(`\n❌ No se puede acceder a ${LOCAL_IMAGES_DIR}`);
      console.error('   Verifica que el volumen esté montado correctamente\n');
      process.exit(1);
    }

    // Obtener productos con imágenes de WordPress
    let query = `
      SELECT
        vi.id as valuation_item_id,
        vi.images,
        i.id as inventory_id
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      WHERE vi.images IS NOT NULL
        AND jsonb_array_length(vi.images) > 0
        AND vi.images::text LIKE '%entrepeques.mx%'
      ORDER BY vi.id
    `;

    if (!all) {
      query += ` LIMIT ${limit}`;
    }

    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log('✅ No hay productos con imágenes de WordPress');
      return;
    }

    console.log(`📸 Productos a procesar: ${result.rows.length}\n`);

    // Estadísticas
    let stats = {
      total: result.rows.length,
      processed: 0,
      skipped: 0,
      totalImages: 0,
      errors: 0
    };

    // Procesar productos
    for (let i = 0; i < result.rows.length; i++) {
      console.log(`[${i + 1}/${result.rows.length}]`, 'sin salto');

      const productResult = await processProduct(result.rows[i], { dryRun });

      if (productResult.skipped) {
        stats.skipped++;
      } else if (productResult.success) {
        stats.processed++;
        stats.totalImages += productResult.successCount;
        stats.errors += productResult.errorCount;
      } else {
        stats.errors++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`✅ Procesados: ${stats.processed}`);
    console.log(`⏭️  Omitidos (ya en S3): ${stats.skipped}`);
    console.log(`🖼️  Imágenes migradas: ${stats.totalImages}`);
    console.log(`❌ Errores: ${stats.errors}`);

    if (dryRun) {
      console.log('\n⚠️  MODO DRY RUN - No se realizaron cambios');
      console.log('   Para ejecutar en producción, omite --dry-run');
    }

    // Mostrar pendientes
    if (!all) {
      const pendingResult = await client.query(`
        SELECT COUNT(*) as total
        FROM valuation_items vi
        JOIN inventario i ON i.valuation_item_id = vi.id
        WHERE vi.images IS NOT NULL
          AND jsonb_array_length(vi.images) > 0
          AND vi.images::text LIKE '%entrepeques.mx%'
      `);

      const pending = pendingResult.rows[0].total - stats.processed - stats.skipped;
      if (pending > 0) {
        console.log(`\n📌 Quedan ${pending} productos por migrar`);
        console.log('   Para migrar todos usa: --all');
      }
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ayuda
if (process.argv.includes('--help')) {
  console.log(`
Uso: node migrate-images.js [opciones]

Opciones:
  --dry-run    Modo simulación (no hace cambios)
  --limit <n>  Procesar solo n productos (default: 5)
  --all        Procesar todos los productos
  --help       Esta ayuda

Ejemplos:
  # Prueba con 5 productos
  node migrate-images.js --dry-run

  # Migrar 10 productos
  node migrate-images.js --limit 10

  # Migrar todos
  node migrate-images.js --all
  `);
  process.exit(0);
}

// Ejecutar
main()
  .then(() => {
    console.log('\n✨ Proceso completado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  });