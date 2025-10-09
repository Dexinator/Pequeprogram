#!/usr/bin/env node
/**
 * Script para generar SQLs de corrección (sin ejecución)
 */

const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');
const path = require('path');

// Mapeo COMPLETO de subcategorías
const SUBCATEGORY_MAPPING = {
  'Autoasientos': 1, 'Cargando al peque': 2, 'Carriolas': 3, 'Accesorios Carriola y Auto': 4,
  'Montables de exterior': 5, 'Triciclos y bicicletas': 6, 'Sobre ruedas': 8, 'Otros de Paseo': 9,
  'Cunas de madera': 10, 'Colechos y Moisés': 11, 'Cunas de viaje': 12, 'Juegos de cuna': 13,
  'Colchones': 14, 'Almohadas y donas': 15, 'Móviles de cuna': 16, 'Barandal para cama': 17,
  'Muebles de recámara': 18, 'Accesorios Recámara': 19, 'Sillas para comer': 20,
  'Mecedoras y Columpios de bebé': 21, 'Brincolines': 22, 'Monitores': 26,
  'Higiene y accesorios': 27, 'Bañeras': 28, 'Lactancia': 30, 'Calentador de biberones': 31,
  'Esterilizador de biberones': 32, 'Extractores de leche': 33, 'Procesador de alimentos': 34,
  'Accesorios de alimentación': 35, 'Niña cuerpo completo': 36, 'Niña arriba de cintura': 37,
  'Niña abajo de cintura': 38, 'Niño cuerpo completo': 39, 'Niño arriba de cintura': 40,
  'Calzado Niña': 42, 'Calzado Niño': 43, 'Accesorios y Bolsas de Dama': 44, 'Juguetes': 46,
  'Disfraces': 47, 'Juegos de mesa': 48, 'Mesa de actividades': 49, 'Libros y rompecabezas': 50,
  'Gimnasios y tapetes': 51, 'Andaderas': 52, 'Montables y correpasillos Bebé': 53,
  'Montables de exterior': 54, 'Juegos grandes': 57
};

const SUBCATEGORY_TO_CATEGORY = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1,
  10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2,
  20: 3, 21: 3, 22: 3, 26: 3, 27: 3, 28: 3,
  30: 4, 31: 4, 32: 4, 33: 4, 34: 4, 35: 4,
  36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 42: 5, 43: 5, 44: 5,
  46: 6, 47: 6, 48: 6, 49: 6, 50: 6, 51: 6, 52: 6, 53: 6, 54: 6, 57: 6
};

const SUBCATEGORY_SKUS = {
  1: 'AUTP', 2: 'CAPP', 3: 'CARP', 4: 'ACAP', 5: 'MDEP', 6: 'TYBP', 8: 'SORP', 9: 'ODPP',
  10: 'CDMP', 11: 'CYMP', 12: 'CDVP', 13: 'JDCP', 14: 'COLP', 15: 'AYDP', 16: 'MDCP', 17: 'BPCP', 18: 'MDRP', 19: 'ACRP',
  20: 'SPCP', 21: 'MCBP', 22: 'BRIP', 26: 'MONP', 27: 'HYAP', 28: 'BANP',
  30: 'LACP', 31: 'CDBP', 32: 'EDBP', 33: 'EDLP', 34: 'PDAP', 35: 'ADAP',
  36: 'MCCP', 37: 'MACP', 38: 'MBCP', 39: 'HCCP', 40: 'HACP', 42: 'CMNP', 43: 'CHNP', 44: 'ABDP',
  46: 'JUGP', 47: 'DISP', 48: 'JDMP', 49: 'MDAP', 50: 'LYRP', 51: 'GYTP', 52: 'ANDP', 53: 'MCRP', 54: 'MDEP', 57: 'JGGP'
};

const pool = new Pool({
  connectionString: 'postgres://u5ctdlrr5k6j8r:pe1f4f515a5f9afc7e6f85cb5ece49d1952527402a05c9afd287bd371c0d2f679@c5p86clmevrg5s.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d5gshf3lbk7b4h',
  ssl: { rejectUnauthorized: false }
});

async function readCsvSubcategories() {
  return new Promise((resolve, reject) => {
    const skuToSubcategory = {};
    console.log('📖 Leyendo CSV original...');
    fs.createReadStream(path.join(__dirname, 'productos_old_store.csv'))
      .pipe(csv.parse({ columns: true, skip_empty_lines: true, bom: true, relax_quotes: true, relax_column_count: true }))
      .on('data', (row) => {
        const sku = (row['SKU'] || '').trim();
        if (!sku) return;
        const catStr = (row['Categorías'] || '').trim();
        if (!catStr || !catStr.includes('>')) return;
        const parts = catStr.split('>').map(p => p.trim());
        if (parts.length < 2) return;
        let subcategory = parts[1];
        if (subcategory.includes('?')) {
          if (subcategory.includes('Mois')) subcategory = 'Colechos y Moisés';
          else if (subcategory.includes('Rec')) subcategory = 'Accesorios Recámara';
          else if (subcategory.includes('Beb')) subcategory = 'Montables y correpasillos Bebé';
        }
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
  for (const row of result.rows) {
    const { id: viId, notes, subcategory_id: currentSubId, category_id: currentCatId, inventory_id } = row;
    let oldSku = null;
    if (notes && notes.includes('SKU')) {
      const parts = notes.split('|')[0].trim();
      if (parts.includes(':')) oldSku = parts.split(':')[1].trim().split(' ')[0];
    }
    if (!oldSku || !(oldSku in skuToSubcategory)) continue;
    const correctData = skuToSubcategory[oldSku];
    const correctSubId = correctData.subcategory_id;
    if (correctSubId !== 46) {
      misclassified.push({
        viId, oldSku, inventory_id, currentSubId, currentCatId,
        correctSubId, correctCatId: correctData.category_id,
        correctSubName: correctData.subcategory_name, productName: correctData.product_name
      });
    }
  }

  console.log(`✅ Encontrados ${misclassified.length} productos mal clasificados\n`);
  return misclassified;
}

async function getNextSkuNumber(subcategoryId) {
  const skuPrefix = SUBCATEGORY_SKUS[subcategoryId] || 'UNKN';
  const result = await pool.query(`SELECT id FROM inventario WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`, [`${skuPrefix}%`]);
  if (result.rows.length > 0) {
    const match = result.rows[0].id.match(/(\d+)$/);
    if (match) return parseInt(match[1]) + 1;
  }
  return 1;
}

async function generateCorrectionSqls(misclassified) {
  console.log('📝 Generando SQLs de corrección...');
  const sqlUpdates = [];
  const skuChanges = [];
  const skuCounters = {};

  for (const product of misclassified) {
    const { viId, correctSubId, correctCatId, inventory_id, oldSku, productName } = product;
    sqlUpdates.push(`UPDATE valuation_items SET subcategory_id = ${correctSubId}, category_id = ${correctCatId} WHERE id = ${viId};`);

    if (inventory_id) {
      if (!(correctSubId in skuCounters)) skuCounters[correctSubId] = await getNextSkuNumber(correctSubId);
      let newSkuNumber = skuCounters[correctSubId];
      const skuPrefix = SUBCATEGORY_SKUS[correctSubId];
      let newSku = `${skuPrefix}${String(newSkuNumber).padStart(3, '0')}`;
      let exists = await pool.query('SELECT 1 FROM inventario WHERE id = $1', [newSku]);
      while (exists.rows.length > 0) {
        newSkuNumber++;
        newSku = `${skuPrefix}${String(newSkuNumber).padStart(3, '0')}`;
        exists = await pool.query('SELECT 1 FROM inventario WHERE id = $1', [newSku]);
      }
      sqlUpdates.push(`UPDATE inventario SET id = '${newSku}' WHERE id = '${inventory_id}';`);
      skuChanges.push({ old: inventory_id, new: newSku, original_sku: oldSku, product: productName });
      skuCounters[correctSubId] = newSkuNumber + 1;
    }
  }

  return { sqlUpdates, skuChanges };
}

async function main() {
  try {
    console.log('='.repeat(80));
    console.log('🔧 GENERACIÓN DE SQLs DE CORRECCIÓN');
    console.log('='.repeat(80));
    console.log();

    const skuToSubcategory = await readCsvSubcategories();
    const misclassified = await findMisclassifiedProducts(skuToSubcategory);

    if (misclassified.length === 0) {
      console.log('✨ No hay productos mal clasificados!');
      await pool.end();
      return;
    }

    const { sqlUpdates, skuChanges } = await generateCorrectionSqls(misclassified);

    // Guardar SQLs
    fs.writeFileSync(
      path.join(__dirname, 'correction-sqls.sql'),
      `-- CORRECCIÓN MASIVA DE PRODUCTOS MAL CLASIFICADOS\n` +
      `-- Total de updates: ${sqlUpdates.length}\n\n` +
      `BEGIN;\n\n` +
      sqlUpdates.join('\n') +
      `\n\nCOMMIT;\n`
    );
    console.log(`✅ SQLs generados: scripts/correction-sqls.sql (${sqlUpdates.length} statements)`);

    // Guardar mapeo
    let skuMapContent = 'MAPEO DE CORRECCIÓN DE SKUs\n' + '='.repeat(80) + '\n\n';
    for (const change of skuChanges) {
      skuMapContent += `${change.old.padEnd(15)} → ${change.new.padEnd(15)} | Original: ${change.original_sku.padEnd(15)} | ${change.product}\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'sku-corrections.txt'), skuMapContent);
    console.log(`✅ Mapeo de SKUs: scripts/sku-corrections.txt (${skuChanges.length} cambios)`);

    console.log('\n✨ Archivos generados exitosamente!');
    console.log('\nPara ejecutar:');
    console.log('  docker exec entrepeques-db-dev psql [CONNECTION] -f /path/to/correction-sqls.sql');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await pool.end();
  }
}

main();
