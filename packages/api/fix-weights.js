const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
  user: 'user',
  password: 'password',
  host: 'db',
  port: 5432,
  database: 'entrepeques_dev'
});

// Función para parsear peso (convertir kg a gramos)
function parseWeight(weightStr) {
  if (!weightStr) return null;
  const weight = parseFloat(weightStr);
  if (isNaN(weight) || weight === 0) return null;
  // Convertir kg a gramos
  return Math.round(weight * 1000);
}

async function fixWeights() {
  const client = await pool.connect();

  try {
    console.log('🔧 Iniciando corrección de pesos...\n');

    // Leer archivo CSV
    const csvData = fs.readFileSync('/tmp/productos_old_store.csv', 'utf-8');

    // Parsear CSV
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

    // Obtener el mapeo de SKUs desde la tabla sku_migration_map
    const mappingResult = await client.query(`
      SELECT old_sku, new_sku, valuation_item_id
      FROM sku_migration_map
    `);

    const skuMap = new Map();
    mappingResult.rows.forEach(row => {
      skuMap.set(row.old_sku, {
        newSku: row.new_sku,
        valuationItemId: row.valuation_item_id
      });
    });

    console.log(`📋 SKUs mapeados en DB: ${skuMap.size}\n`);

    await client.query('BEGIN');

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('Actualizando pesos...\n');

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const oldSku = row['SKU'];
      const pesoKg = row['Peso (kg)'];

      try {
        if (!oldSku) {
          skippedCount++;
          continue;
        }

        const weightGrams = parseWeight(pesoKg);

        // Si no hay peso en el CSV, saltar
        if (weightGrams === null) {
          process.stdout.write(`\r[${i + 1}/${records.length}] ${oldSku}: Sin peso en CSV, omitido`);
          skippedCount++;
          continue;
        }

        // Buscar el mapeo
        const mapping = skuMap.get(oldSku);

        if (!mapping) {
          // Intentar buscar directamente en inventario
          const directResult = await client.query(`
            SELECT valuation_item_id
            FROM inventario
            WHERE id = $1
          `, [oldSku]);

          if (directResult.rows.length === 0) {
            process.stdout.write(`\r[${i + 1}/${records.length}] ${oldSku}: No encontrado en DB`);
            skippedCount++;
            continue;
          }

          mapping = { valuationItemId: directResult.rows[0].valuation_item_id };
        }

        if (!mapping.valuationItemId) {
          skippedCount++;
          continue;
        }

        // Actualizar el peso en valuation_items
        const updateResult = await client.query(`
          UPDATE valuation_items
          SET weight_grams = $1,
              weight_kg = $2,
              updated_at = NOW()
          WHERE id = $3
        `, [weightGrams, weightGrams / 1000, mapping.valuationItemId]);

        if (updateResult.rowCount > 0) {
          process.stdout.write(`\r[${i + 1}/${records.length}] ${oldSku}: ${pesoKg}kg → ${weightGrams}g ✓`);
          updatedCount++;
        }

      } catch (error) {
        process.stdout.write(`\r[${i + 1}/${records.length}] ${oldSku}: ERROR - ${error.message}`);
        errorCount++;
      }

      // Pequeña pausa cada 100 registros para mostrar progreso
      if (i % 100 === 0 && i > 0) {
        console.log(`\n   Progreso: ${updatedCount} actualizados, ${skippedCount} omitidos, ${errorCount} errores`);
      }
    }

    await client.query('COMMIT');

    // Limpiar línea de progreso
    process.stdout.write('\r' + ' '.repeat(100) + '\r');

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN DE PESOS');
    console.log('='.repeat(60));
    console.log(`✅ Pesos actualizados: ${updatedCount}`);
    console.log(`⏭️  Productos omitidos: ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📝 Total procesado: ${records.length}`);
    console.log('='.repeat(60));

    // Verificar algunos ejemplos
    console.log('\n📋 VERIFICACIÓN DE EJEMPLOS:');
    console.log('-'.repeat(60));

    const verificationResult = await client.query(`
      SELECT i.id as sku, vi.weight_kg, vi.weight_grams
      FROM valuation_items vi
      JOIN inventario i ON i.valuation_item_id = vi.id
      WHERE vi.valuation_id IN (
        SELECT id FROM valuations WHERE notes LIKE '%WooCommerce%'
      )
      ORDER BY i.id
      LIMIT 10
    `);

    verificationResult.rows.forEach(row => {
      console.log(`${row.sku}: ${row.weight_kg} kg (${row.weight_grams}g)`);
    });

    console.log('\n✅ Corrección de pesos completada exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n\n❌ Error crítico:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar corrección
console.log('=' + '='.repeat(60));
console.log('CORRECCIÓN DE PESOS - PRODUCTOS MIGRADOS');
console.log('=' + '='.repeat(60) + '\n');

fixWeights()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Proceso falló:', err.message);
    process.exit(1);
  });
