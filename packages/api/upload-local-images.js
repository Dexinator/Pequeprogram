const { Pool } = require('pg');
const AWS = require('aws-sdk');
const sharp = require('sharp');
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
const LOCAL_IMAGES_PATH = '/mnt/c/Coding/ProdsIMGS';

// Función para procesar y optimizar imagen con Sharp
async function processImage(imagePath, maxWidth = 1200, quality = 85) {
  try {
    const buffer = await sharp(imagePath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: quality,
        progressive: true
      })
      .toBuffer();

    return buffer;
  } catch (error) {
    console.error('  ⚠️ Error procesando imagen, usando original:', error.message);
    return fs.readFileSync(imagePath);
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

// Función principal
async function uploadLocalImages() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando subida de imágenes locales a AWS S3...\n');
    console.log('📋 Configuración:');
    console.log(`   - Directorio local: ${LOCAL_IMAGES_PATH}`);
    console.log(`   - Bucket S3: ${BUCKET_NAME}`);
    console.log(`   - Región: ${process.env.AWS_REGION || 'us-east-2'}\n`);

    // Verificar conexión a S3
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ Conexión a S3 verificada\n');
    } catch (error) {
      console.error('❌ No se pudo conectar a S3:', error.message);
      return;
    }

    // Obtener mapeo de SKUs antiguos a nuevos
    console.log('📊 Obteniendo mapeo de SKUs...\n');
    const mappingQuery = `
      SELECT
        SUBSTRING(notes FROM 'SKU: ([^ ]+)') as old_sku,
        i.id as new_sku,
        vi.id as valuation_item_id
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      WHERE notes LIKE 'SKU:%'
      ORDER BY old_sku
    `;

    const mappingResult = await client.query(mappingQuery);
    const skuMap = {};
    mappingResult.rows.forEach(row => {
      skuMap[row.old_sku] = {
        new_sku: row.new_sku,
        valuation_item_id: row.valuation_item_id
      };
    });

    console.log(`📦 SKUs mapeados: ${Object.keys(skuMap).length}\n`);

    // Leer archivos del directorio local
    const files = fs.readdirSync(LOCAL_IMAGES_PATH);
    console.log(`📸 Archivos encontrados: ${files.length}\n`);

    // Agrupar archivos por SKU
    const imagesByOldSku = {};
    files.forEach(file => {
      // Extraer SKU del nombre del archivo
      // Formato: HSACRP4.jpg o HSACRP4(1).jpg
      const match = file.match(/^([A-Z]+\d+)/);
      if (match) {
        const oldSku = match[1];
        if (!imagesByOldSku[oldSku]) {
          imagesByOldSku[oldSku] = [];
        }
        imagesByOldSku[oldSku].push(file);
      }
    });

    console.log(`📦 Productos con imágenes: ${Object.keys(imagesByOldSku).length}\n`);
    console.log('='.repeat(60) + '\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let totalImages = 0;
    const limit = process.argv[2] === 'all' ? 10000 : 10;

    // Procesar cada SKU
    const skusToProcess = Object.keys(imagesByOldSku).slice(0, limit);

    for (let i = 0; i < skusToProcess.length; i++) {
      const oldSku = skusToProcess[i];
      const images = imagesByOldSku[oldSku].sort(); // Ordenar para mantener consistencia

      // Verificar si tenemos mapeo para este SKU
      if (!skuMap[oldSku]) {
        console.log(`⏭️ [${i + 1}/${skusToProcess.length}] ${oldSku}: Sin mapeo en BD`);
        skippedCount++;
        continue;
      }

      const { new_sku, valuation_item_id } = skuMap[oldSku];
      console.log(`\n[${i + 1}/${skusToProcess.length}] ${oldSku} → ${new_sku}`);
      console.log(`  📸 ${images.length} imagen(es)`);

      const s3Urls = [];

      // Procesar cada imagen
      for (let j = 0; j < images.length; j++) {
        const imageFile = images[j];
        const localPath = path.join(LOCAL_IMAGES_PATH, imageFile);

        try {
          // Leer y procesar imagen
          console.log(`  📥 Procesando: ${imageFile}`);
          const processedBuffer = await processImage(localPath);

          // Generar nombre para S3
          const s3Key = `products/${new_sku}/${new_sku}_${j + 1}.jpg`;

          // Subir a S3
          const s3Url = await uploadToS3(processedBuffer, s3Key);
          s3Urls.push(s3Url);
          totalImages++;

        } catch (error) {
          console.error(`  ❌ Error con ${imageFile}: ${error.message}`);
          errorCount++;
        }
      }

      // Actualizar URLs en la base de datos si subimos imágenes
      if (s3Urls.length > 0) {
        try {
          await client.query(
            'UPDATE valuation_items SET images = $1 WHERE id = $2',
            [JSON.stringify(s3Urls), valuation_item_id]
          );
          successCount++;
          console.log(`  ✅ BD actualizada con ${s3Urls.length} imágenes`);
        } catch (error) {
          console.error(`  ❌ Error actualizando BD: ${error.message}`);
          errorCount++;
        }
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos procesados: ${successCount}`);
    console.log(`📸 Imágenes subidas: ${totalImages}`);
    console.log(`⏭️ Productos saltados: ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    if (limit === 10) {
      const total = Object.keys(imagesByOldSku).length;
      if (total > 10) {
        console.log('\n⚠️ NOTA: Esta fue una prueba con 10 productos.');
        console.log(`   Hay ${total} productos en total con imágenes locales.`);
        console.log('   Para procesar todos, ejecuta: node upload-local-images.js all');
      }
    }

    console.log('\n✨ Proceso completado');

  } catch (error) {
    console.error('\n❌ Error en proceso:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Verificar configuración antes de empezar
async function verifySetup() {
  console.log('🔍 Verificando configuración...\n');

  // Verificar directorio local
  if (!fs.existsSync(LOCAL_IMAGES_PATH)) {
    console.error(`❌ No se encuentra el directorio: ${LOCAL_IMAGES_PATH}`);
    return false;
  }

  const files = fs.readdirSync(LOCAL_IMAGES_PATH);
  console.log(`✅ Directorio local encontrado con ${files.length} archivos`);

  // Verificar AWS
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ AWS_ACCESS_KEY_ID no está configurada');
    return false;
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS_SECRET_ACCESS_KEY no está configurada');
    return false;
  }

  console.log('✅ Credenciales AWS encontradas\n');
  return true;
}

// Ejecutar
async function main() {
  console.log('='.repeat(60));
  console.log('SUBIDA DE IMÁGENES LOCALES → AWS S3');
  console.log('='.repeat(60) + '\n');

  const setupOk = await verifySetup();
  if (!setupOk) {
    console.error('\n⚠️ Corrige la configuración primero.');
    process.exit(1);
  }

  await uploadLocalImages();
}

main()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Proceso falló:', err.message);
    process.exit(1);
  });