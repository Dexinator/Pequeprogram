const { Pool } = require('pg');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@db:5432/entrepeques_dev'
});

// Configuración de AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-2'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pequetienda';

// Función para descargar imagen desde URL
async function downloadImage(url) {
  try {
    console.log(`  📥 Descargando: ${url.substring(0, 50)}...`);

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error(`  ❌ Error descargando: ${error.message}`);

    // Si falla con HTTPS, intentar con HTTP
    if (url.startsWith('https://') && error.code === 'ECONNREFUSED') {
      const httpUrl = url.replace('https://', 'http://');
      console.log(`  🔄 Reintentando con HTTP...`);

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
async function processImage(buffer, maxWidth = 1200, quality = 85) {
  try {
    const processed = await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: quality,
        progressive: true
      })
      .toBuffer();

    return processed;
  } catch (error) {
    console.error('  ⚠️ Error procesando imagen, usando original:', error.message);
    return buffer;
  }
}

// Función para subir imagen a S3
async function uploadToS3(buffer, key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000'
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`  ✅ Subida a S3: ${key}`);
    return result.Location;
  } catch (error) {
    console.error(`  ❌ Error subiendo a S3: ${error.message}`);
    throw error;
  }
}

// Función principal de migración
async function migrateImages() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración de imágenes a AWS S3...\n');
    console.log('📋 Configuración:');
    console.log(`   - Bucket: ${BUCKET_NAME}`);
    console.log(`   - Región: ${process.env.AWS_REGION || 'us-east-2'}\n`);

    // Verificar conexión a S3
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ Conexión a S3 verificada\n');
    } catch (error) {
      console.error('❌ No se pudo conectar a S3. Verifica las credenciales AWS.');
      console.error(`   Error: ${error.message}`);
      return;
    }

    // Obtener productos con imágenes de WordPress
    const query = `
      SELECT
        vi.id,
        vi.images,
        vi.notes,
        i.id as inventory_id
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      WHERE vi.images IS NOT NULL
        AND vi.images::text != '[]'
        AND vi.images::text LIKE '%entrepeques.mx%'
      ORDER BY vi.id
      LIMIT $1
    `;

    // Empezar con 10 productos para prueba
    const limit = process.argv[2] === 'all' ? 1000 : 10;
    console.log(`📦 Procesando ${limit === 1000 ? 'TODOS los' : limit} productos...\n`);

    const result = await client.query(query, [limit]);

    if (result.rows.length === 0) {
      console.log('✅ No hay productos con imágenes de WordPress para migrar');
      return;
    }

    console.log(`📸 Productos encontrados: ${result.rows.length}\n`);
    console.log('='.repeat(60) + '\n');

    let successCount = 0;
    let errorCount = 0;
    let totalImages = 0;

    // Procesar cada producto
    for (let i = 0; i < result.rows.length; i++) {
      const product = result.rows[i];
      console.log(`\n[${i + 1}/${result.rows.length}] Producto: ${product.inventory_id}`);

      if (!product.images || product.images.length === 0) {
        console.log('  ⏭️ Sin imágenes');
        continue;
      }

      const newUrls = [];
      let productImageCount = 0;

      // Procesar cada imagen del producto
      for (let j = 0; j < product.images.length; j++) {
        const originalUrl = product.images[j];

        // Verificar si ya es una URL de S3
        if (originalUrl.includes('amazonaws.com') || originalUrl.includes('pequetienda')) {
          console.log(`  ⏭️ Imagen ${j + 1} ya está en S3`);
          newUrls.push(originalUrl);
          continue;
        }

        try {
          // Descargar imagen
          const imageBuffer = await downloadImage(originalUrl);

          // Procesar imagen (optimizar)
          const processedBuffer = await processImage(imageBuffer);

          // Generar nombre para S3
          const s3Key = `products/${product.inventory_id}/${product.inventory_id}_${j + 1}.jpg`;

          // Subir a S3
          const s3Url = await uploadToS3(processedBuffer, s3Key);
          newUrls.push(s3Url);

          productImageCount++;
          totalImages++;

        } catch (error) {
          console.error(`  ❌ Error con imagen ${j + 1}: ${error.message}`);
          // Mantener URL original si falla
          newUrls.push(originalUrl);
          errorCount++;
        }
      }

      // Actualizar URLs en la base de datos
      if (productImageCount > 0) {
        await client.query(
          'UPDATE valuation_items SET images = $1 WHERE id = $2',
          [JSON.stringify(newUrls), product.id]
        );
        successCount++;
        console.log(`  ✅ ${productImageCount} imágenes migradas`);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos procesados: ${successCount}`);
    console.log(`📸 Imágenes migradas: ${totalImages}`);
    console.log(`❌ Errores: ${errorCount}`);

    if (limit === 10 && result.rows.length === 10) {
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM valuation_items vi
        JOIN inventario i ON i.valuation_item_id = vi.id
        WHERE vi.images IS NOT NULL
          AND vi.images::text != '[]'
          AND vi.images::text LIKE '%entrepeques.mx%'
      `;

      const totalResult = await client.query(totalQuery);
      const total = totalResult.rows[0].total;

      if (total > 10) {
        console.log('\n⚠️ NOTA: Esta fue una prueba con 10 productos.');
        console.log(`   Hay ${total} productos en total con imágenes de WordPress.`);
        console.log('   Para migrar todos, ejecuta: node migrate-images-to-s3.js all');
      }
    }

    console.log('\n✨ Migración completada');

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Verificar configuración de AWS antes de empezar
async function verifyAWSConfig() {
  console.log('🔍 Verificando configuración de AWS...\n');

  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ AWS_ACCESS_KEY_ID no está configurada');
    return false;
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS_SECRET_ACCESS_KEY no está configurada');
    return false;
  }

  console.log('✅ Credenciales AWS encontradas');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌎 Región: ${process.env.AWS_REGION || 'us-east-2'}\n`);

  return true;
}

// Ejecutar migración
async function main() {
  console.log('='.repeat(60));
  console.log('MIGRACIÓN DE IMÁGENES - WORDPRESS → AWS S3');
  console.log('='.repeat(60) + '\n');

  const awsOk = await verifyAWSConfig();
  if (!awsOk) {
    console.error('\n⚠️ Corrige la configuración de AWS primero.');
    process.exit(1);
  }

  await migrateImages();
}

// Ejecutar
main()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Proceso falló:', err.message);
    process.exit(1);
  });