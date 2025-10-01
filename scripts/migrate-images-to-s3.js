const { Pool } = require('pg');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const pool = new Pool({
  user: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'entrepeques_dev'
});

// Configuración de AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA6ODU4K4PJ7R44ZGR',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'us-east-2'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pequetienda';

// Configuración de procesamiento
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 }
};

// Función para descargar imagen desde URL
async function downloadImage(url) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 segundos timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Error descargando imagen ${url}:`, error.message);

    // Si falla, intentar con protocolo HTTP en lugar de HTTPS
    if (url.startsWith('https://') && error.code === 'ECONNREFUSED') {
      const httpUrl = url.replace('https://', 'http://');
      console.log(`  Reintentando con HTTP: ${httpUrl}`);

      const response = await axios({
        method: 'GET',
        url: httpUrl,
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data);
    }

    throw error;
  }
}

// Función para procesar y optimizar imagen con Sharp
async function processImage(buffer, size) {
  try {
    const processed = await sharp(buffer)
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    return processed;
  } catch (error) {
    console.error('Error procesando imagen:', error.message);
    // Si falla el procesamiento, devolver la imagen original
    return buffer;
  }
}

// Función para subir imagen a S3
async function uploadToS3(buffer, key, contentType = 'image/jpeg') {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error(`Error subiendo a S3 ${key}:`, error.message);
    throw error;
  }
}

// Función para migrar imágenes de un producto
async function migrateProductImages(product, skuMap) {
  const { id, images, inventory_id, notes } = product;

  // Buscar el nuevo SKU si fue migrado
  let sku = inventory_id;
  if (skuMap && notes && notes.includes('SKU Original:')) {
    const match = notes.match(/SKU Original:\s*([^\s|]+)/);
    if (match && skuMap[match[1]]) {
      sku = skuMap[match[1]];
    }
  }

  if (!images || images.length === 0) {
    return { id, sku, status: 'sin_imagenes', urls: [] };
  }

  const newUrls = [];
  const errors = [];

  for (let i = 0; i < images.length; i++) {
    const originalUrl = images[i];

    try {
      // Verificar si ya es una URL de S3
      if (originalUrl.includes('amazonaws.com') || originalUrl.includes('pequetienda')) {
        console.log(`  ⏭️  Imagen ${i + 1} ya está en S3`);
        newUrls.push(originalUrl);
        continue;
      }

      console.log(`  📥 Descargando imagen ${i + 1}/${images.length}...`);

      // Descargar imagen original
      const imageBuffer = await downloadImage(originalUrl);

      // Procesar y subir diferentes tamaños
      const uploadedUrls = {};

      for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
        const processedBuffer = await processImage(imageBuffer, dimensions);

        const s3Key = `products/${sku}/${sku}_${i + 1}_${sizeName}.jpg`;

        console.log(`  📤 Subiendo ${sizeName} a S3...`);
        const url = await uploadToS3(processedBuffer, s3Key);

        uploadedUrls[sizeName] = url;
      }

      // Subir imagen original también
      const originalKey = `products/${sku}/${sku}_${i + 1}_original.jpg`;
      console.log(`  📤 Subiendo original a S3...`);
      const originalS3Url = await uploadToS3(imageBuffer, originalKey);
      uploadedUrls.original = originalS3Url;

      // Usar la versión 'large' como URL principal
      newUrls.push(uploadedUrls.large || uploadedUrls.original);

      console.log(`  ✅ Imagen ${i + 1} migrada exitosamente`);

    } catch (error) {
      console.error(`  ❌ Error con imagen ${i + 1}: ${error.message}`);
      errors.push({
        url: originalUrl,
        error: error.message
      });

      // Mantener la URL original si falla la migración
      newUrls.push(originalUrl);
    }
  }

  return {
    id,
    sku,
    status: errors.length > 0 ? 'parcial' : 'exitoso',
    originalUrls: images,
    newUrls,
    errors
  };
}

// Función principal de migración
async function migrateAllImages() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración de imágenes a AWS S3...\n');

    // Cargar mapeo de SKUs si existe
    let skuMap = {};
    const mappingFile = path.join(__dirname, 'sku-mapping.json');

    if (fs.existsSync(mappingFile)) {
      const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
      skuMap = mapping.reduce((acc, item) => {
        acc[item.old] = item.new;
        return acc;
      }, {});
      console.log(`📋 Mapeo de SKUs cargado: ${Object.keys(skuMap).length} entradas\n`);
    }

    // Obtener todos los productos con imágenes de WordPress
    const query = `
      SELECT
        vi.id,
        vi.images,
        vi.notes,
        i.id as inventory_id,
        s.name as subcategory_name
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      LEFT JOIN subcategories s ON vi.subcategory_id = s.id
      WHERE vi.online_store_ready = true
        AND vi.images IS NOT NULL
        AND vi.images::text != '[]'
        AND vi.images::text LIKE '%entrepeques.mx%'
      ORDER BY vi.id
      LIMIT 10
    `; // Empezar con 10 productos para prueba

    console.log('📊 Buscando productos con imágenes de WordPress...\n');
    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log('✅ No hay productos con imágenes de WordPress para migrar');
      return;
    }

    console.log(`📦 Productos encontrados: ${result.rows.length}\n`);
    console.log('Procesando productos...\n');
    console.log('=' + '='.repeat(60) + '\n');

    const migrationResults = [];
    let successCount = 0;
    let partialCount = 0;
    let errorCount = 0;

    // Procesar cada producto
    for (let i = 0; i < result.rows.length; i++) {
      const product = result.rows[i];

      console.log(`[${i + 1}/${result.rows.length}] Producto: ${product.inventory_id} - ${product.subcategory_name}`);
      console.log(`  📸 Imágenes a migrar: ${product.images.length}`);

      const migrationResult = await migrateProductImages(product, skuMap);
      migrationResults.push(migrationResult);

      // Actualizar URLs en la base de datos si la migración fue exitosa
      if (migrationResult.status !== 'sin_imagenes' && migrationResult.newUrls.length > 0) {
        await client.query(`
          UPDATE valuation_items
          SET images = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(migrationResult.newUrls), product.id]);

        if (migrationResult.status === 'exitoso') {
          successCount++;
          console.log(`  ✅ Migración completa\n`);
        } else {
          partialCount++;
          console.log(`  ⚠️  Migración parcial (${migrationResult.errors.length} errores)\n`);
        }
      } else {
        errorCount++;
        console.log(`  ❌ Sin imágenes o error completo\n`);
      }
    }

    // Guardar resultados de migración
    const reportFile = path.join(__dirname, `image-migration-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(migrationResults, null, 2));

    // Mostrar resumen
    console.log('=' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN DE IMÁGENES');
    console.log('=' + '='.repeat(60));
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`⚠️  Parciales: ${partialCount}`);
    console.log(`❌ Con errores: ${errorCount}`);
    console.log(`📦 Total procesado: ${result.rows.length}`);
    console.log(`\n📄 Reporte detallado guardado en: ${reportFile}`);

    // Si fue una prueba, mostrar mensaje para migración completa
    if (result.rows.length === 10) {
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM valuation_items
        WHERE online_store_ready = true
          AND images IS NOT NULL
          AND images::text != '[]'
          AND images::text LIKE '%entrepeques.mx%'
      `;

      const totalResult = await client.query(totalQuery);
      const total = totalResult.rows[0].total;

      if (total > 10) {
        console.log('\n⚠️  NOTA: Esta fue una prueba con 10 productos.');
        console.log(`    Hay ${total} productos en total con imágenes de WordPress.`);
        console.log('    Para migrar todos, edita el script y quita el LIMIT 10.');
      }
    }

    console.log('\n✨ Migración de imágenes completada');

  } catch (error) {
    console.error('\n❌ Error en migración de imágenes:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Script para verificar configuración de AWS
async function verifyAWSConfig() {
  console.log('🔍 Verificando configuración de AWS S3...\n');

  try {
    // Verificar acceso al bucket
    const buckets = await s3.listBuckets().promise();
    console.log('✅ Conexión a AWS exitosa');
    console.log(`📦 Buckets disponibles: ${buckets.Buckets.map(b => b.Name).join(', ')}\n`);

    // Verificar permisos en el bucket específico
    const testKey = `test/connection-test-${Date.now()}.txt`;
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: 'Test connection',
      ACL: 'public-read'
    }).promise();

    console.log(`✅ Permisos de escritura en bucket '${BUCKET_NAME}' verificados`);

    // Limpiar archivo de prueba
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: testKey
    }).promise();

    return true;
  } catch (error) {
    console.error('❌ Error en configuración de AWS:', error.message);
    console.log('\nVerifica las siguientes variables de entorno:');
    console.log('- AWS_ACCESS_KEY_ID');
    console.log('- AWS_SECRET_ACCESS_KEY');
    console.log('- AWS_REGION');
    console.log('- S3_BUCKET_NAME');
    return false;
  }
}

// Ejecutar migración
async function main() {
  console.log('=' + '='.repeat(60));
  console.log('MIGRACIÓN DE IMÁGENES - WORDPRESS → AWS S3');
  console.log('=' + '='.repeat(60) + '\n');

  // Verificar configuración de AWS primero
  const awsOk = await verifyAWSConfig();
  if (!awsOk) {
    console.error('\n⚠️  Abortando migración. Corrige la configuración de AWS primero.');
    process.exit(1);
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Ejecutar migración
  await migrateAllImages();
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--verify')) {
  verifyAWSConfig()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  main()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Proceso falló:', err.message);
      process.exit(1);
    });
}