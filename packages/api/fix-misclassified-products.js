#!/usr/bin/env node
/**
 * Script para corregir productos mal clasificados durante la migración.
 *
 * Este script:
 * 1. Lee el CSV original para obtener las categorías correctas
 * 2. Consulta productos mal clasificados en producción
 * 3. Genera y ejecuta SQLs de corrección
 * 4. Regenera SKUs según subcategoría correcta
 */

const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');
const path = require('path');
const readline = require('readline');

// Mapeo COMPLETO de subcategorías (nombre -> ID en base de datos)
const SUBCATEGORY_MAPPING = {
  // ========== A PASEAR ==========
  'Autoasientos': 1,
  'Cargando al peque': 2,
  'Carriolas': 3,
  'Accesorios Carriola y Auto': 4,
  'Montables de exterior': 5,
  'Triciclos y bicicletas': 6,
  'Sobre ruedas': 8,
  'Otros de Paseo': 9,

  // ========== A DORMIR ==========
  'Cunas de madera': 10,
  'Colechos y Moisés': 11,
  'Cunas de viaje': 12,
  'Juegos de cuna': 13,
  'Colchones': 14,
  'Almohadas y donas': 15,
  'Móviles de cuna': 16,
  'Barandal para cama': 17,
  'Muebles de recámara': 18,
  'Accesorios Recámara': 19,

  // ========== EN CASA ==========
  'Sillas para comer': 20,
  'Mecedoras y Columpios de bebé': 21,
  'Brincolines': 22,
  'Monitores': 26,
  'Higiene y accesorios': 27,
  'Bañeras': 28,

  // ========== A COMER ==========
  'Lactancia': 30,
  'Calentador de biberones': 31,
  'Esterilizador de biberones': 32,
  'Extractores de leche': 33,
  'Procesador de alimentos': 34,
  'Accesorios de alimentación': 35,

  // ========== ROPA ==========
  'Niña cuerpo completo': 36,
  'Niña arriba de cintura': 37,
  'Niña abajo de cintura': 38,
  'Niño cuerpo completo': 39,
  'Niño arriba de cintura': 40,
  'Calzado Niña': 42,
  'Calzado Niño': 43,
  'Accesorios y Bolsas de Dama': 44,

  // ========== A JUGAR ==========
  'Juguetes': 46,
  'Disfraces': 47,
  'Juegos de mesa': 48,
  'Mesa de actividades': 49,
  'Libros y rompecabezas': 50,
  'Gimnasios y tapetes': 51,
  'Andaderas': 52,
  'Montables y correpasillos Bebé': 53,
  'Montables de exterior': 54,
  'Juegos grandes': 57
};

// Subcategoría a categoría (para lookup inverso)
const SUBCATEGORY_TO_CATEGORY = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1,  // A pasear
  10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2,  // A dormir
  20: 3, 21: 3, 22: 3, 26: 3, 27: 3, 28: 3,  // En casa
  30: 4, 31: 4, 32: 4, 33: 4, 34: 4, 35: 4,  // A comer
  36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 42: 5, 43: 5, 44: 5,  // Ropa
  46: 6, 47: 6, 48: 6, 49: 6, 50: 6, 51: 6, 52: 6, 53: 6, 54: 6, 57: 6  // A jugar
};

// SKU prefixes por subcategoría
const SUBCATEGORY_SKUS = {
  1: 'AUTP', 2: 'CAPP', 3: 'CARP', 4: 'ACAP', 5: 'MDEP', 6: 'TYBP', 8: 'SORP', 9: 'ODPP',
  10: 'CDMP', 11: 'CYMP', 12: 'CDVP', 13: 'JDCP', 14: 'COLP', 15: 'AYDP', 16: 'MDCP', 17: 'BPCP', 18: 'MDRP', 19: 'ACRP',
  20: 'SPCP', 21: 'MCBP', 22: 'BRIP', 26: 'MONP', 27: 'HYAP', 28: 'BANP',
  30: 'LACP', 31: 'CDBP', 32: 'EDBP', 33: 'EDLP', 34: 'PDAP', 35: 'ADAP',
  36: 'MCCP', 37: 'MACP', 38: 'MBCP', 39: 'HCCP', 40: 'HACP', 42: 'CMNP', 43: 'CHNP', 44: 'ABDP',
  46: 'JUGP', 47: 'DISP', 48: 'JDMP', 49: 'MDAP', 50: 'LYRP', 51: 'GYTP', 52: 'ANDP', 53: 'MCRP', 54: 'MDEP', 57: 'JGGP'
};

// Configuración de base de datos de producción
const pool = new Pool({
  connectionString: 'postgres://u5ctdlrr5k6j8r:pe1f4f515a5f9afc7e6f85cb5ece49d1952527402a05c9afd287bd371c0d2f679@c5p86clmevrg5s.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d5gshf3lbk7b4h',
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper para preguntar en consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Lee el CSV y crea un mapa de SKU -> subcategoría correcta
async function readCsvSubcategories() {
  return new Promise((resolve, reject) => {
    const skuToSubcategory = {};

    console.log('📖 Leyendo CSV original...');

    fs.createReadStream(path.join(__dirname, 'productos_old_store.csv'))
      .pipe(csv.parse({
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_quotes: true,
        relax_column_count: true
      }))
      .on('data', (row) => {
        const sku = (row['SKU'] || '').trim();
        if (!sku) return;

        const catStr = (row['Categorías'] || '').trim();
        if (!catStr || !catStr.includes('>')) return;

        const parts = catStr.split('>').map(p => p.trim());
        if (parts.length < 2) return;

        let subcategory = parts[1];

        // Normalizar caracteres mal codificados
        if (subcategory.includes('?')) {
          if (subcategory.includes('Mois')) {
            subcategory = 'Colechos y Moisés';
          } else if (subcategory.includes('Rec')) {
            subcategory = 'Accesorios Recámara';
          } else if (subcategory.includes('Beb')) {
            subcategory = 'Montables y correpasillos Bebé';
          }
        }

        // Verificar que la subcategoría esté en el mapeo
        if (subcategory in SUBCATEGORY_MAPPING) {
          const subcategoryId = SUBCATEGORY_MAPPING[subcategory];
          const categoryId = SUBCATEGORY_TO_CATEGORY[subcategoryId];

          skuToSubcategory[sku] = {
            subcategory_id: subcategoryId,
            category_id: categoryId,
            subcategory_name: subcategory,
            product_name: row['Nombre'] || ''
          };
        }
      })
      .on('end', () => {
        console.log(`✅ Procesados ${Object.keys(skuToSubcategory).length} productos del CSV\n`);
        resolve(skuToSubcategory);
      })
      .on('error', reject);
  });
}

// Encuentra productos mal clasificados en producción
async function findMisclassifiedProducts(skuToSubcategory) {
  console.log('🔍 Buscando productos mal clasificados en producción...');

  const result = await pool.query(`
    SELECT vi.id, vi.notes, vi.subcategory_id, vi.category_id,
           i.id as inventory_id, s.name as current_subcategory
    FROM valuation_items vi
    LEFT JOIN inventario i ON vi.id = i.valuation_item_id
    LEFT JOIN subcategories s ON vi.subcategory_id = s.id
    WHERE vi.subcategory_id = 46
    ORDER BY vi.id
  `);

  const misclassified = [];
  const legitimateToys = [];
  const unknownSkus = [];

  for (const row of result.rows) {
    const { id: viId, notes, subcategory_id: currentSubId, category_id: currentCatId, inventory_id, current_subcategory } = row;

    // Extraer SKU original del campo notes
    let oldSku = null;
    if (notes && notes.includes('SKU')) {
      const parts = notes.split('|')[0].trim();
      if (parts.includes(':')) {
        oldSku = parts.split(':')[1].trim().split(' ')[0];
      }
    }

    if (!oldSku) {
      unknownSkus.push({ viId, notes, inventory_id });
      continue;
    }

    // Verificar si debería estar en otra categoría
    if (oldSku in skuToSubcategory) {
      const correctData = skuToSubcategory[oldSku];
      const correctSubId = correctData.subcategory_id;

      // Si la subcategoría correcta NO es Juguetes, está mal clasificado
      if (correctSubId !== 46) {
        misclassified.push({
          viId,
          oldSku,
          inventory_id,
          currentSubId,
          currentCatId,
          correctSubId,
          correctCatId: correctData.category_id,
          correctSubName: correctData.subcategory_name,
          productName: correctData.product_name
        });
      } else {
        legitimateToys.push(viId);
      }
    } else {
      unknownSkus.push({ viId, oldSku, notes, inventory_id });
    }
  }

  console.log(`✅ Análisis completado:`);
  console.log(`   - Total productos con subcategory_id=46: ${result.rows.length}`);
  console.log(`   - Juguetes legítimos: ${legitimateToys.length}`);
  console.log(`   - Mal clasificados: ${misclassified.length}`);
  console.log(`   - SKUs no encontrados en CSV: ${unknownSkus.length}\n`);

  return { misclassified, legitimateToys, unknownSkus };
}

// Obtiene el siguiente número de SKU disponible para una subcategoría
async function getNextSkuNumber(subcategoryId) {
  const skuPrefix = SUBCATEGORY_SKUS[subcategoryId] || 'UNKN';

  const result = await pool.query(
    `SELECT id FROM inventario WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${skuPrefix}%`]
  );

  if (result.rows.length > 0) {
    const lastSku = result.rows[0].id;
    const match = lastSku.match(/(\d+)$/);
    if (match) {
      return parseInt(match[1]) + 1;
    }
  }

  return 1;
}

// Genera SQLs de corrección
async function generateCorrectionSqls(misclassified) {
  console.log('📝 Generando SQLs de corrección...\n');

  const sqlUpdates = [];
  const skuChanges = [];
  const skuCounters = {};

  for (const product of misclassified) {
    const { viId, correctSubId, correctCatId, inventory_id, oldSku, productName } = product;

    // SQL para actualizar valuation_items
    sqlUpdates.push(
      `UPDATE valuation_items SET subcategory_id = ${correctSubId}, category_id = ${correctCatId} WHERE id = ${viId};`
    );

    // Generar nuevo SKU para inventario si existe
    if (inventory_id) {
      if (!(correctSubId in skuCounters)) {
        skuCounters[correctSubId] = await getNextSkuNumber(correctSubId);
      }

      let newSkuNumber = skuCounters[correctSubId];
      const skuPrefix = SUBCATEGORY_SKUS[correctSubId];
      let newSku = `${skuPrefix}${String(newSkuNumber).padStart(3, '0')}`;

      // Verificar que el nuevo SKU no existe
      let exists = await pool.query('SELECT 1 FROM inventario WHERE id = $1', [newSku]);
      while (exists.rows.length > 0) {
        newSkuNumber++;
        newSku = `${skuPrefix}${String(newSkuNumber).padStart(3, '0')}`;
        exists = await pool.query('SELECT 1 FROM inventario WHERE id = $1', [newSku]);
      }

      sqlUpdates.push(
        `UPDATE inventario SET id = '${newSku}' WHERE id = '${inventory_id}';`
      );

      skuChanges.push({
        old: inventory_id,
        new: newSku,
        original_sku: oldSku,
        product: productName
      });

      skuCounters[correctSubId] = newSkuNumber + 1;
    }
  }

  return { sqlUpdates, skuChanges };
}

// Main
async function main() {
  try {
    console.log('='.repeat(80));
    console.log('🔧 CORRECCIÓN MASIVA DE PRODUCTOS MAL CLASIFICADOS');
    console.log('='.repeat(80));
    console.log();

    // Paso 1: Leer CSV
    const skuToSubcategory = await readCsvSubcategories();

    // Paso 2: Encontrar productos mal clasificados
    const { misclassified, legitimateToys, unknownSkus } = await findMisclassifiedProducts(skuToSubcategory);

    if (misclassified.length === 0) {
      console.log('✨ ¡No hay productos mal clasificados! Todo está correcto.');
      await pool.end();
      rl.close();
      return;
    }

    // Paso 3: Mostrar resumen por subcategoría
    console.log('📊 RESUMEN POR SUBCATEGORÍA CORRECTA:');
    console.log('-'.repeat(80));

    const bySubcategory = {};
    for (const p of misclassified) {
      if (!bySubcategory[p.correctSubName]) {
        bySubcategory[p.correctSubName] = [];
      }
      bySubcategory[p.correctSubName].push(p);
    }

    for (const subName of Object.keys(bySubcategory).sort()) {
      const products = bySubcategory[subName];
      console.log(`   ${subName.padEnd(40)} - ${String(products.length).padStart(3)} productos`);
    }

    console.log();
    console.log('-'.repeat(80));
    console.log(`TOTAL A CORREGIR: ${misclassified.length} productos`);
    console.log('-'.repeat(80));
    console.log();

    // Paso 4: Pedir confirmación
    const response1 = await question('¿Deseas generar los SQLs de corrección? (sí/no): ');
    if (!['sí', 'si', 's', 'yes', 'y'].includes(response1.toLowerCase())) {
      console.log('❌ Operación cancelada');
      await pool.end();
      rl.close();
      return;
    }

    // Paso 5: Generar SQLs
    const { sqlUpdates, skuChanges } = await generateCorrectionSqls(misclassified);

    // Paso 6: Guardar SQLs en archivo
    fs.writeFileSync(
      path.join(__dirname, 'correction-sqls.sql'),
      `-- CORRECCIÓN MASIVA DE PRODUCTOS MAL CLASIFICADOS\n` +
      `-- Generado automáticamente\n` +
      `-- Total de updates: ${sqlUpdates.length}\n\n` +
      `BEGIN;\n\n` +
      sqlUpdates.join('\n') +
      `\n\nCOMMIT;\n`
    );

    console.log(`✅ SQLs generados: scripts/correction-sqls.sql (${sqlUpdates.length} statements)`);

    // Guardar mapeo de SKUs
    let skuMapContent = 'MAPEO DE CORRECCIÓN DE SKUs\n' + '='.repeat(80) + '\n\n';
    for (const change of skuChanges) {
      skuMapContent += `${change.old.padEnd(15)} → ${change.new.padEnd(15)} | Original: ${change.original_sku.padEnd(15)} | ${change.product}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'sku-corrections.txt'), skuMapContent);

    console.log(`✅ Mapeo de SKUs: scripts/sku-corrections.txt (${skuChanges.length} cambios)\n`);

    // Paso 7: Preguntar si ejecutar
    const response2 = await question('¿Deseas EJECUTAR las correcciones en PRODUCCIÓN? (sí/no): ');
    if (!['sí', 'si', 's', 'yes', 'y'].includes(response2.toLowerCase())) {
      console.log('⚠️  Correcciones NO ejecutadas. Revisa los archivos generados.');
      await pool.end();
      rl.close();
      return;
    }

    // Paso 8: Ejecutar correcciones
    console.log('\n🚀 Ejecutando correcciones...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (let i = 0; i < sqlUpdates.length; i++) {
        await client.query(sqlUpdates[i]);
        if ((i + 1) % 50 === 0) {
          console.log(`   Procesados ${i + 1}/${sqlUpdates.length}...`);
        }
      }

      await client.query('COMMIT');
      console.log(`✅ ${sqlUpdates.length} correcciones aplicadas exitosamente!`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error durante la ejecución: ${error.message}`);
      console.error('   Se hizo ROLLBACK. No se aplicaron cambios.');
    } finally {
      client.release();
    }

    console.log('\n' + '='.repeat(80));
    console.log('✨ PROCESO COMPLETADO');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
