const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');
const path = require('path');

// Configuración de base de datos
const pool = new Pool({
  user: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'entrepeques_dev'
});

// Mapeo de categorías del CSV a IDs de la BD
const categoryMapping = {
  'A pasear': 1,
  'A dormir': 2,
  'En casa': 3,
  'A comer': 4,
  'A Jugar': 6,
  'Baño': 3 // Baño se mapea a "En Casa"
};

// Mapeo de subcategorías basado en el análisis del CSV
const subcategoryMapping = {
  // A pasear
  'Autoasientos': 1,
  'Carriolas': 3,
  'Otros de Paseo': 9,

  // A dormir
  'Cunas de madera': 10,
  'Cunas de viaje': 12,
  'Muebles de recámara': 18,
  'Almohadas y donas': 15,

  // En casa
  'Sillas para comer': 20,
  'Brincolines': 22,
  'Monitores': 26,
  'Higiene y accesorios': 27,

  // A comer
  'Lactancia': 30,
  'Calentador de biberones': 31,

  // A jugar
  'Juguetes': 46,
  'Juegos grandes': 57,
  'Montables y correpasillos Bebé': 53,
  'Gimnasios y tapetes': 51
};

// Cache para subcategorías
const subcategoryCache = {};

// Función para generar nuevo SKU respetando el sistema actual
async function generateInventoryId(client, oldSku, subcategoryId) {
  try {
    // 1. Obtener SKU de subcategoría (usar cache)
    if (!subcategoryCache[subcategoryId]) {
      const subQuery = await client.query(
        'SELECT sku, name FROM subcategories WHERE id = $1',
        [subcategoryId]
      );
      if (subQuery.rows.length === 0) {
        throw new Error(`Subcategoría ${subcategoryId} no encontrada`);
      }
      subcategoryCache[subcategoryId] = subQuery.rows[0];
    }

    const subcategorySku = subcategoryCache[subcategoryId].sku;

    // 2. Intentar preservar número del SKU antiguo si coincide
    const oldSkuMatch = oldSku ? oldSku.match(/([A-Z]+)(\d+)/) : null;
    if (oldSkuMatch) {
      // Verificar si el prefijo del SKU antiguo contiene parte del SKU de subcategoría
      const oldPrefix = oldSkuMatch[1];
      const oldNumber = oldSkuMatch[2];

      // Si el SKU antiguo parece compatible, intentar preservar el número
      if (oldPrefix.includes(subcategorySku.substring(0, 3)) ||
          subcategorySku.includes(oldPrefix.substring(2, 5))) {
        const newSku = `${subcategorySku}${oldNumber.padStart(3, '0')}`;

        // Verificar si está disponible
        const exists = await client.query(
          'SELECT 1 FROM inventario WHERE id = $1',
          [newSku]
        );

        if (exists.rows.length === 0) {
          console.log(`  ✓ Preservando número: ${oldSku} → ${newSku}`);
          return newSku;
        }
      }
    }

    // 3. Si no, buscar siguiente número disponible
    const maxQuery = await client.query(`
      SELECT id FROM inventario
      WHERE id LIKE $1
      ORDER BY id DESC
      LIMIT 1
    `, [`${subcategorySku}%`]);

    let nextNumber = 1;
    if (maxQuery.rows.length > 0) {
      const lastId = maxQuery.rows[0].id;
      const match = lastId.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }

    const newSku = `${subcategorySku}${nextNumber.toString().padStart(3, '0')}`;
    console.log(`  ✓ Nuevo SKU generado: ${oldSku} → ${newSku}`);
    return newSku;

  } catch (error) {
    console.error(`Error generando SKU para ${oldSku}:`, error.message);
    throw error;
  }
}

// Función para calcular precio de compra desde precio de venta usando márgenes de la subcategoría
async function calculatePricesFromSale(client, subcategoryId, salePrice) {
  const marginQuery = await client.query(
    'SELECT margin_used, gap_used FROM subcategories WHERE id = $1',
    [subcategoryId]
  );

  if (marginQuery.rows.length === 0) {
    throw new Error(`Subcategoría ${subcategoryId} no encontrada para cálculo de precios`);
  }

  const { margin_used, gap_used } = marginQuery.rows[0];
  const margin = parseFloat(margin_used);

  // Calcular precio de compra usando el margen inverso
  // Si margen es 0.60, entonces precio_venta = precio_compra * 1.60
  // Por lo tanto: precio_compra = precio_venta / 1.60
  const purchasePrice = salePrice / (1 + margin);

  return {
    suggested_purchase_price: Math.round(purchasePrice * 100) / 100,
    suggested_sale_price: Math.round(salePrice * 100) / 100,
    store_credit_price: Math.round(purchasePrice * 1.1 * 100) / 100, // +10% para crédito
    consignment_price: Math.round(purchasePrice * 1.2 * 100) / 100,  // +20% para consignación
    margin_used: margin,
    gap_used: parseFloat(gap_used)
  };
}

// Función para extraer marca del nombre
function extractBrand(nombre, descripcion) {
  const brands = [
    'Fisher Price', 'Chicco', 'Graco', 'Stokke', 'Maxicosi', 'Maxi-Cosi', 'Maxi Cosi',
    'Cybex', 'Evenflo', 'Medela', 'Boon', 'Skip Hop', 'Angelcare', 'Motorola',
    'Prince Lionheart', 'Phil&Teds', 'Phil & Teds', 'SmartTrike', 'Smart Trike',
    'Svan', 'Step2', 'Step 2', 'Bright Starts', 'Baby Jogger', 'Uppababy', 'UPPAbaby',
    'Bugaboo', 'Baby Trend', 'Safety 1st', 'Summer Infant', 'Munchkin', 'Nuna',
    'Peg Perego', 'Britax', 'Joie', 'Cosco', 'Doona', 'Ergobaby', 'BabyBjorn'
  ];

  const text = `${nombre} ${descripcion}`.toLowerCase();

  for (const brand of brands) {
    if (text.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'General';
}

// Función para parsear precio
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remover caracteres no numéricos excepto punto
  return parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) || 0;
}

// Función para parsear peso
function parseWeight(weightStr) {
  if (!weightStr) return null;
  const weight = parseFloat(weightStr);
  if (isNaN(weight) || weight === 0) return null;
  // Convertir kg a gramos
  return Math.round(weight * 1000);
}

// Función para parsear imágenes
function parseImages(imagesStr) {
  if (!imagesStr) return [];

  // Las URLs están separadas por comas y pueden tener espacios
  const urls = imagesStr.split(',')
    .map(url => url.trim())
    .filter(url => url && url.startsWith('http'));

  return urls;
}

// Función para extraer features del nombre y descripción
function extractFeatures(row) {
  const features = {};

  // Extraer información de la descripción corta
  if (row['Descripción corta']) {
    const shortDesc = row['Descripción corta'];

    // Buscar características como "Reclinable", "Plegable", etc.
    if (shortDesc.includes('Reclinable')) features.reclinable = 'Sí';
    if (shortDesc.includes('No Reclinable')) features.reclinable = 'No';
    if (shortDesc.includes('Plegable')) features.plegable = 'Sí';
    if (shortDesc.includes('No Plegable')) features.plegable = 'No';
    if (shortDesc.includes('Sistema Isofix')) features.sistema = 'Isofix';
    if (shortDesc.includes('Cinturón de Seguridad')) features.sistema = 'Cinturón';
    if (shortDesc.includes('Travel System')) features.travel_system = 'Sí';
    if (shortDesc.includes('3en1')) features.tipo = '3 en 1';
    if (shortDesc.includes('Con Luz y sonido')) features.luz_sonido = 'Sí';
    if (shortDesc.includes('Sin luz o sonido')) features.luz_sonido = 'No';

    // Extraer talla si existe
    if (shortDesc.includes('Talla')) {
      const tallaMatch = shortDesc.match(/Talla\s+(\d+\.?\d*)/i);
      if (tallaMatch) features.talla = tallaMatch[1];
    }
  }

  // Extraer edad del producto si está en el nombre o descripción
  const text = `${row['Nombre']} ${row['Descripción']}`;
  const edadPatterns = [
    /(\d+)\s*-\s*(\d+)\s*año/i,
    /(\d+)\s*año/i,
    /(\d+)\s*mes/i,
    /0-13\s*kg/i,
    /(\d+)\s*a\s*(\d+)\s*años/i
  ];

  for (const pattern of edadPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.edad = match[0];
      break;
    }
  }

  return features;
}

// Función para determinar condición del producto
function getCondition(descripcion) {
  const desc = descripcion ? descripcion.toLowerCase() : '';
  if (desc.includes('nuevo')) return { status: 'nuevo', condition: 'excelente' };
  if (desc.includes('seminuevo sin detalle')) return { status: 'usado', condition: 'excelente' };
  if (desc.includes('seminuevo con detalle')) return { status: 'usado', condition: 'bueno' };
  return { status: 'usado', condition: 'bueno' }; // Default
}

async function migrateProducts() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migración de productos del sistema anterior...\n');

    // Leer archivo CSV
    const csvData = fs.readFileSync(path.join(__dirname, '../productos_old_store.csv'), 'utf-8');

    // Parsear CSV
    const records = await new Promise((resolve, reject) => {
      csv.parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        bom: true, // Manejar BOM si existe
        relax_quotes: true,
        relax_column_count: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    console.log(`📊 Total de productos a migrar: ${records.length}\n`);

    // Crear tabla de mapeo si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS sku_migration_map (
        old_sku VARCHAR(50) PRIMARY KEY,
        new_sku VARCHAR(50) NOT NULL,
        product_name VARCHAR(255),
        valuation_item_id INTEGER,
        migrated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Crear un cliente genérico para productos del sistema anterior
    const clientResult = await client.query(`
      INSERT INTO clients (name, phone, email, identification, store_credit)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (phone) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING id
    `, ['Tienda Anterior WooCommerce', '5555555555', 'tienda@entrepeques.mx', 'TIENDA-OLD', 0]);

    const clientId = clientResult.rows[0].id;
    console.log(`✅ Cliente creado/encontrado con ID: ${clientId}\n`);

    // 2. Crear una valuación para estos productos
    const valuationResult = await client.query(`
      INSERT INTO valuations (client_id, user_id, valuation_date, status, notes, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      clientId,
      1, // Usuario admin
      new Date(),
      'finalizada',
      `Migración de productos del sistema anterior WooCommerce - ${records.length} productos`,
      'Polanco'
    ]);

    const valuationId = valuationResult.rows[0].id;
    console.log(`✅ Valuación creada con ID: ${valuationId}\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const skuMapping = [];

    console.log('Procesando productos...\n');

    // 3. Procesar cada producto
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const oldSku = row['SKU'] || `OLD-${row['ID']}`;

      try {
        process.stdout.write(`\r[${i + 1}/${records.length}] Procesando: ${oldSku} - ${row['Nombre'] || 'Sin nombre'}...`);

        // Extraer categoría y subcategoría
        const categoriesStr = row['Categorías'] || '';
        const categories = categoriesStr.split('>').map(c => c.trim());

        let categoryId = null;
        let subcategoryId = null;

        // Buscar categoría principal
        for (const cat of categories) {
          for (const [key, value] of Object.entries(categoryMapping)) {
            if (cat.toLowerCase().includes(key.toLowerCase())) {
              categoryId = value;
              break;
            }
          }
          if (categoryId) break;
        }

        // Buscar subcategoría
        for (const cat of categories) {
          for (const [key, value] of Object.entries(subcategoryMapping)) {
            if (cat.toLowerCase().includes(key.toLowerCase())) {
              subcategoryId = value;
              break;
            }
          }
          if (subcategoryId) break;
        }

        // Si no encontramos categoría, usar A jugar por defecto
        if (!categoryId) categoryId = 6;
        if (!subcategoryId) subcategoryId = 46; // Juguetes por defecto

        // Generar nuevo SKU
        const newSku = await generateInventoryId(client, oldSku, subcategoryId);

        // Extraer información del producto
        const brand = extractBrand(row['Nombre'], row['Descripción']);
        const features = extractFeatures(row);
        const { status, condition } = getCondition(row['Descripción'] || '');
        const images = parseImages(row['Imágenes']);
        const weight = parseWeight(row['Peso (kg)']);

        // Parsear precios del CSV
        const precioRebajado = parsePrice(row['Precio rebajado']);
        const precioNormal = parsePrice(row['Precio normal']);

        // El precio de venta online es el precio normal (o rebajado si no hay normal)
        const precioVentaOnline = precioNormal || precioRebajado;

        // Si no hay precio válido, saltar este producto
        if (!precioVentaOnline || precioVentaOnline === 0) {
          throw new Error('Producto sin precio válido');
        }

        // Calcular precios usando márgenes de la subcategoría
        const prices = await calculatePricesFromSale(client, subcategoryId, precioVentaOnline);

        // Determinar si está destacado
        const isFeatured = row['¿Está destacado?'] === '1' || row['¿Está destacado?'] === 'true';

        // Insertar en valuation_items
        const itemResult = await client.query(`
          INSERT INTO valuation_items (
            valuation_id, category_id, subcategory_id,
            status, brand_renown, modality, condition_state,
            demand, cleanliness, features, new_price,
            suggested_purchase_price, suggested_sale_price,
            store_credit_price, consignment_price,
            final_purchase_price, final_sale_price,
            quantity, location, notes,
            online_store_ready, weight_grams, online_price,
            online_featured, images,
            online_prepared_at, online_prepared_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25, $26, $27
          ) RETURNING id
        `, [
          valuationId,
          categoryId,
          subcategoryId,
          status,
          'Normal',
          'compra directa',
          condition,
          'media',
          'buena',
          JSON.stringify(features),
          precioRebajado || precioVentaOnline * 2, // Precio de referencia
          prices.suggested_purchase_price,
          prices.suggested_sale_price,
          prices.store_credit_price,
          prices.consignment_price,
          prices.suggested_purchase_price, // final_purchase_price
          prices.suggested_sale_price,      // final_sale_price
          parseInt(row['Inventario']) || 1,
          'Polanco',
          `SKU Original: ${oldSku} | ${row['Nombre'] || ''}`.substring(0, 255),
          true, // Ya está listo para tienda online
          weight,
          precioVentaOnline,
          isFeatured,
          JSON.stringify(images),
          new Date(),
          1 // Usuario admin
        ]);

        const valuationItemId = itemResult.rows[0].id;

        // Insertar en inventario con el nuevo SKU
        await client.query(`
          INSERT INTO inventario (id, quantity, location, valuation_item_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE
          SET quantity = inventario.quantity + EXCLUDED.quantity,
              valuation_item_id = EXCLUDED.valuation_item_id
        `, [
          newSku,
          parseInt(row['Inventario']) || 1,
          'Polanco',
          valuationItemId
        ]);

        // Guardar mapeo de SKUs
        await client.query(`
          INSERT INTO sku_migration_map (old_sku, new_sku, product_name, valuation_item_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (old_sku) DO UPDATE
          SET new_sku = EXCLUDED.new_sku,
              valuation_item_id = EXCLUDED.valuation_item_id
        `, [
          oldSku,
          newSku,
          row['Nombre'] || 'Sin nombre',
          valuationItemId
        ]);

        skuMapping.push({ old: oldSku, new: newSku, name: row['Nombre'] });
        successCount++;

      } catch (error) {
        errorCount++;
        errors.push({
          sku: oldSku,
          nombre: row['Nombre'],
          error: error.message
        });
      }
    }

    // Limpiar línea de progreso
    process.stdout.write('\r' + ' '.repeat(100) + '\r');

    // Commit transacción
    await client.query('COMMIT');

    // Generar reporte
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos migrados exitosamente: ${successCount}`);
    console.log(`❌ Productos con errores: ${errorCount}`);
    console.log(`📝 Total procesado: ${records.length}`);

    if (errors.length > 0) {
      console.log('\n❌ PRODUCTOS CON ERRORES:');
      console.log('-'.repeat(60));
      errors.slice(0, 10).forEach(e => {
        console.log(`SKU: ${e.sku}`);
        console.log(`Nombre: ${e.nombre || 'Sin nombre'}`);
        console.log(`Error: ${e.error}`);
        console.log('-'.repeat(40));
      });

      if (errors.length > 10) {
        console.log(`... y ${errors.length - 10} errores más`);
      }

      // Guardar errores en archivo
      fs.writeFileSync(
        path.join(__dirname, 'migration-errors.json'),
        JSON.stringify(errors, null, 2)
      );
      console.log('\n📄 Errores completos guardados en: scripts/migration-errors.json');
    }

    // Guardar mapeo de SKUs
    fs.writeFileSync(
      path.join(__dirname, 'sku-mapping.json'),
      JSON.stringify(skuMapping, null, 2)
    );
    console.log('📄 Mapeo de SKUs guardado en: scripts/sku-mapping.json');

    // Mostrar algunos ejemplos de mapeo
    console.log('\n📋 EJEMPLOS DE MAPEO DE SKUs:');
    console.log('-'.repeat(60));
    skuMapping.slice(0, 5).forEach(map => {
      console.log(`${map.old} → ${map.new} (${map.name})`);
    });

    console.log('\n✨ SIGUIENTE PASO:');
    console.log('   1. Revisar productos en la base de datos');
    console.log('   2. Ejecutar migración de imágenes: node scripts/migrate-images-to-s3.js');
    console.log('   3. Verificar en: http://localhost:4323/preparar-productos');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n\n❌ Error crítico en migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
console.log('=' + '='.repeat(60));
console.log('MIGRACIÓN DE PRODUCTOS - WOOCOMMERCE → ENTREPEQUES');
console.log('=' + '='.repeat(60) + '\n');

migrateProducts()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migración falló:', err.message);
    process.exit(1);
  });