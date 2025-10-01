const fs = require('fs');
const csv = require('csv-parse');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://user:password@db:5432/entrepeques_dev'
});

// Mapeo simple de categorías
const categoryMapping = {
  'A pasear': 1,
  'A dormir': 2,
  'En casa': 3,
  'A comer': 4,
  'A Jugar': 6,
  'Baño': 3
};

// Mapeo de subcategorías
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

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración simplificada...');
    
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
    
    console.log(`📊 Productos encontrados: ${records.length}\n`);
    
    await client.query('BEGIN');
    
    // Crear cliente
    const clientResult = await client.query(`
      INSERT INTO clients (name, phone, email, identification, store_credit)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (phone) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING id
    `, ['Tienda WooCommerce', '5555555555', 'tienda@entrepeques.mx', 'TIENDA-OLD', 0]);
    
    const clientId = clientResult.rows[0].id;
    console.log(`✅ Cliente ID: ${clientId}\n`);
    
    // Crear valuación
    const valuationResult = await client.query(`
      INSERT INTO valuations (client_id, user_id, valuation_date, status, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [clientId, 1, new Date(), 'finalizada', 'Migración WooCommerce']);
    
    const valuationId = valuationResult.rows[0].id;
    console.log(`✅ Valuación ID: ${valuationId}\n`);
    
    let count = 0;
    let errors = 0;
    
    // Procesar solo los primeros 10 productos como prueba
    for (const row of records) {
      try {
        const sku = row['SKU'] || `OLD-${row['ID']}`;
        const nombre = row['Nombre'] || 'Sin nombre';
        const precio = parseFloat(row['Precio normal'] || row['Precio rebajado'] || 0);
        
        if (precio === 0) {
          console.log(`⏭️ Saltando ${sku}: sin precio`);
          continue;
        }
        
        // Detectar categoría
        let categoryId = 6; // Por defecto A jugar
        let subcategoryId = 46; // Por defecto Juguetes
        
        const categoriesStr = row['Categorías'] || '';
        for (const [key, value] of Object.entries(subcategoryMapping)) {
          if (categoriesStr.includes(key)) {
            subcategoryId = value;
            break;
          }
        }
        
        // Calcular precio de compra (usando margen 60%)
        const precioCompra = precio / 1.6;
        
        // Insertar producto
        const itemResult = await client.query(`
          INSERT INTO valuation_items (
            valuation_id, category_id, subcategory_id,
            status, brand_renown, modality, condition_state,
            demand, cleanliness, new_price, quantity,
            suggested_purchase_price, suggested_sale_price,
            final_purchase_price, final_sale_price,
            notes, location, online_store_ready, online_price
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17, $18, $19
          ) RETURNING id
        `, [
          valuationId, categoryId, subcategoryId,
          'usado', 'Normal', 'compra directa', 'bueno',
          'media', 'buena', precio * 2, parseInt(row['Inventario']) || 1,
          precioCompra, precio, precioCompra, precio,
          `SKU: ${sku} - ${nombre}`, 'Polanco', true, precio
        ]);
        
        // Generar nuevo SKU para inventario
        const subQuery = await client.query(
          'SELECT sku FROM subcategories WHERE id = $1',
          [subcategoryId]
        );
        const subcatSku = subQuery.rows[0]?.sku || 'PROD';
        
        const maxQuery = await client.query(
          "SELECT id FROM inventario WHERE id LIKE $1 ORDER BY id DESC LIMIT 1",
          [subcatSku + '%']
        );
        
        let nextNum = 1;
        if (maxQuery.rows.length > 0) {
          const match = maxQuery.rows[0].id.match(/\d+$/);
          if (match) nextNum = parseInt(match[0]) + 1;
        }
        
        const newSku = subcatSku + nextNum.toString().padStart(3, '0');
        
        // Insertar en inventario
        await client.query(`
          INSERT INTO inventario (id, quantity, location, valuation_item_id)
          VALUES ($1, $2, $3, $4)
        `, [newSku, parseInt(row['Inventario']) || 1, 'Polanco', itemResult.rows[0].id]);
        
        count++;
        console.log(`✅ [${count}] ${sku} → ${newSku}: ${nombre}`);
        
      } catch (err) {
        errors++;
        console.log(`❌ Error: ${err.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\n✅ Migración completada: ${count} productos, ${errors} errores`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
