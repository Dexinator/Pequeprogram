const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'user',
  password: 'password',
  host: 'db',
  port: 5432,
  database: 'entrepeques_dev'
});

// Mapeo de subcategorías (del script de migración original)
const subcategoryMapping = {
  'Autoasientos': 1,
  'Carriolas': 3,
  'Otros de Paseo': 9,
  'Cunas de madera': 10,
  'Cunas de viaje': 12,
  'Muebles de recámara': 18,
  'Almohadas y donas': 15,
  'Sillas para comer': 20,
  'Brincolines': 22,
  'Monitores': 26,
  'Higiene y accesorios': 27,
  'Lactancia': 30,
  'Calentador de biberones': 31,
  'Juguetes': 46,
  'Juegos grandes': 57,
  'Montables y correpasillos Bebé': 53,
  'Gimnasios y tapetes': 51
};

function parseWeight(weightStr) {
  if (!weightStr) return null;
  const weight = parseFloat(weightStr);
  if (isNaN(weight) || weight === 0) return null;
  return Math.round(weight * 1000); // Convertir kg a gramos
}

async function updateWeightsByCategory() {
  const client = await pool.connect();

  try {
    console.log('🔧 Actualizando pesos por categoría...\n');

    // Leer archivo CSV
    const csvData = fs.readFileSync('/tmp/productos_old_store.csv', 'utf-8');
    const records = await new Promise((resolve, reject) => {
      csv.parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_quotes: true,
        relax_column_count: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    console.log(`📊 Total de productos en CSV: ${records.length}\n`);

    // Agrupar productos del CSV por subcategoría con sus pesos
    const productsBySubcategory = {};

    for (const row of records) {
      const categoriesStr = row['Categorías'] || '';
      const categories = categoriesStr.split('>').map(c => c.trim());

      let subcategoryId = null;

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

      if (!subcategoryId) subcategoryId = 46; // Juguetes por defecto

      const weightGrams = parseWeight(row['Peso (kg)']);

      if (!productsBySubcategory[subcategoryId]) {
        productsBySubcategory[subcategoryId] = [];
      }

      productsBySubcategory[subcategoryId].push({
        sku: row['SKU'],
        weight: weightGrams,
        name: row['Nombre']
      });
    }

    console.log('📋 Productos agrupados por subcategoría:\n');
    for (const [subcatId, products] of Object.entries(productsBySubcategory)) {
      const withWeight = products.filter(p => p.weight !== null).length;
      console.log(`  Subcat ${subcatId}: ${products.length} productos (${withWeight} con peso)`);
    }

    await client.query('BEGIN');

    let updatedCount = 0;
    let totalProcessed = 0;

    console.log('\n📦 Actualizando pesos por subcategoría...\n');

    for (const [subcatId, csvProducts] of Object.entries(productsBySubcategory)) {
      // Obtener productos de la DB para esta subcategoría con peso 0.5
      const dbResult = await client.query(`
        SELECT vi.id, vi.weight_kg
        FROM valuation_items vi
        WHERE vi.subcategory_id = $1
          AND vi.weight_kg = 0.5
        ORDER BY vi.id
      `, [subcatId]);

      const dbProducts = dbResult.rows;

      if (dbProducts.length === 0) {
        console.log(`⏭️  Subcat ${subcatId}: No hay productos con peso 0.5 en DB`);
        continue;
      }

      // Filtrar productos del CSV que tienen peso
      const csvProductsWithWeight = csvProducts.filter(p => p.weight !== null);

      if (csvProductsWithWeight.length === 0) {
        console.log(`⏭️  Subcat ${subcatId}: No hay pesos en CSV para esta subcategoría`);
        continue;
      }

      console.log(`\n🔄 Procesando Subcategoría ${subcatId}:`);
      console.log(`   - ${dbProducts.length} productos en DB`);
      console.log(`   - ${csvProductsWithWeight.length} productos con peso en CSV`);

      // Si hay la misma cantidad, hacer mapeo 1:1
      if (dbProducts.length === csvProductsWithWeight.length) {
        for (let i = 0; i < dbProducts.length; i++) {
          const dbProd = dbProducts[i];
          const csvProd = csvProductsWithWeight[i];

          if (csvProd.weight) {
            await client.query(`
              UPDATE valuation_items
              SET weight_grams = $1,
                  weight_kg = $2,
                  updated_at = NOW()
              WHERE id = $3
            `, [csvProd.weight, csvProd.weight / 1000, dbProd.id]);

            updatedCount++;
          }
        }
        console.log(`   ✅ Actualiz ados ${dbProducts.length} productos (mapeo 1:1)`);
      }
      // Si hay más productos en DB que en CSV, asignar pesos cíclicamente
      else {
        for (let i = 0; i < dbProducts.length; i++) {
          const dbProd = dbProducts[i];
          const csvProd = csvProductsWithWeight[i % csvProductsWithWeight.length];

          if (csvProd.weight) {
            await client.query(`
              UPDATE valuation_items
              SET weight_grams = $1,
                  weight_kg = $2,
                  updated_at = NOW()
              WHERE id = $3
            `, [csvProd.weight, csvProd.weight / 1000, dbProd.id]);

            updatedCount++;
          }
        }
        console.log(`   ✅ Actualizados ${dbProducts.length} productos (mapeo cíclico)`);
      }

      totalProcessed += dbProducts.length;
    }

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados: ${updatedCount}`);
    console.log(`📝 Total procesado: ${totalProcessed}`);
    console.log('='.repeat(60));

    // Verificación
    console.log('\n📋 VERIFICACIÓN (primeros 10 productos por subcategoría):');
    console.log('-'.repeat(60));

    const verificationResult = await client.query(`
      SELECT i.id as sku, vi.subcategory_id, vi.weight_kg, vi.weight_grams
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      WHERE vi.subcategory_id IN (1, 3, 46, 20, 57)
      ORDER BY vi.subcategory_id, i.id
      LIMIT 10
    `);

    verificationResult.rows.forEach(row => {
      console.log(`Subcat ${row.subcategory_id} | ${row.sku}: ${row.weight_kg} kg (${row.weight_grams}g)`);
    });

    console.log('\n✅ Actualización completada');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('='.repeat(60));
console.log('ACTUALIZACIÓN DE PESOS POR CATEGORÍA');
console.log('='.repeat(60) + '\n');

updateWeightsByCategory()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Proceso falló:', err.message);
    process.exit(1);
  });
