const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://user:password@db:5432/entrepeques_dev'
});

async function updateImages() {
  const client = await pool.connect();
  
  try {
    console.log('📸 Actualizando imágenes de productos...');
    
    // Leer CSV
    const csvData = fs.readFileSync('/tmp/productos_old_store.csv', 'utf-8');
    
    const records = await new Promise((resolve, reject) => {
      csv.parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_quotes: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });
    
    console.log(`📊 Productos en CSV: ${records.length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const row of records) {
      const sku = row['SKU'] || `OLD-${row['ID']}`;
      const imagesStr = row['Imágenes'] || '';
      
      if (!imagesStr || imagesStr.trim() === '') {
        skippedCount++;
        continue;
      }
      
      // Parsear URLs de imágenes
      const imageUrls = imagesStr
        .split(',')
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http'));
      
      if (imageUrls.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Buscar el producto por el SKU en las notas
      const result = await client.query(
        "UPDATE valuation_items SET images = $1 WHERE notes LIKE $2 RETURNING id",
        [JSON.stringify(imageUrls), `%SKU: ${sku}%`]
      );
      
      if (result.rows.length > 0) {
        updatedCount++;
        console.log(`✅ ${sku}: ${imageUrls.length} imágenes`);
      }
    }
    
    console.log(`\n✅ Actualización completa: ${updatedCount} productos con imágenes`);
    console.log(`⏭️ Saltados (sin imágenes): ${skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateImages();
