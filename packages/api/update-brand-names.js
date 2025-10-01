const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://user:password@db:5432/entrepeques_dev'
});

async function updateBrandNames() {
  const client = await pool.connect();
  
  try {
    console.log('🏷️ Actualizando brand_name con primera palabra del nombre...');
    
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
    
    console.log(`📊 Total de productos: ${records.length}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Primero crear todas las marcas únicas
    const uniqueBrands = new Set();
    const brandMap = {};
    
    // Recolectar todas las marcas únicas
    for (const row of records) {
      const nombre = row['Nombre'] || '';
      if (nombre) {
        const firstWord = nombre.trim().split(' ')[0];
        if (firstWord) {
          uniqueBrands.add(firstWord);
        }
      }
    }
    
    console.log(`📝 Marcas únicas encontradas: ${uniqueBrands.size}\n`);
    
    // Crear o buscar cada marca
    for (const brandName of uniqueBrands) {
      // Verificar si ya existe
      const checkBrand = await client.query(
        'SELECT id FROM brands WHERE name = $1 LIMIT 1',
        [brandName]
      );
      
      if (checkBrand.rows.length > 0) {
        brandMap[brandName] = checkBrand.rows[0].id;
      } else {
        // Crear nueva marca (usando subcategoría 46 - Juguetes como default)
        const newBrand = await client.query(
          'INSERT INTO brands (name, renown, subcategory_id) VALUES ($1, $2, $3) RETURNING id',
          [brandName, 'Normal', 46]
        );
        brandMap[brandName] = newBrand.rows[0].id;
        console.log(`  ✨ Marca creada: ${brandName}`);
      }
    }
    
    console.log(`\n🔄 Actualizando productos...\n`);
    
    // Actualizar cada producto
    for (const row of records) {
      const sku = row['SKU'] || `OLD-${row['ID']}`;
      const nombre = row['Nombre'] || '';
      
      if (!nombre) {
        skippedCount++;
        continue;
      }
      
      // Obtener primera palabra como marca
      const firstWord = nombre.trim().split(' ')[0];
      
      if (firstWord && brandMap[firstWord]) {
        // Actualizar brand_id en valuation_items
        const result = await client.query(
          'UPDATE valuation_items SET brand_id = $1 WHERE notes LIKE $2 RETURNING id',
          [brandMap[firstWord], `%SKU: ${sku}%`]
        );
        
        if (result.rows.length > 0) {
          updatedCount++;
          if (updatedCount % 50 === 0) {
            console.log(`  Procesados: ${updatedCount} productos`);
          }
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Actualización completa:`);
    console.log(`   - Productos actualizados: ${updatedCount}`);
    console.log(`   - Productos saltados: ${skippedCount}`);
    console.log(`   - Marcas creadas/utilizadas: ${Object.keys(brandMap).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateBrandNames();
