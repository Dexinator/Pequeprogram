const fs = require('fs');
const csv = require('csv-parse');
const path = require('path');

const categories = new Set();
const subcategories = new Map(); // Map de categoría -> Set de subcategorías

fs.createReadStream(path.join(__dirname, '../productos_old_store.csv'))
  .pipe(csv.parse({
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true
  }))
  .on('data', (row) => {
    const catStr = row['Categorías'] || '';
    if (catStr) {
      const parts = catStr.split('>').map(p => p.trim());
      if (parts.length >= 2) {
        const category = parts[0];
        const subcategory = parts[1];

        categories.add(category);

        if (!subcategories.has(category)) {
          subcategories.set(category, new Set());
        }
        subcategories.get(category).add(subcategory);
      }
    }
  })
  .on('end', () => {
    console.log('='.repeat(70));
    console.log('ANÁLISIS DE CATEGORÍAS Y SUBCATEGORÍAS EN EL CSV');
    console.log('='.repeat(70));
    console.log();

    const sortedCategories = Array.from(categories).sort();

    sortedCategories.forEach(category => {
      console.log(`\n📁 ${category}`);
      const subs = Array.from(subcategories.get(category)).sort();
      subs.forEach(sub => {
        console.log(`   └─ ${sub}`);
      });
    });

    console.log();
    console.log('='.repeat(70));
    console.log(`Total categorías: ${categories.size}`);
    let totalSubs = 0;
    subcategories.forEach(s => totalSubs += s.size);
    console.log(`Total subcategorías: ${totalSubs}`);
    console.log('='.repeat(70));
  });
