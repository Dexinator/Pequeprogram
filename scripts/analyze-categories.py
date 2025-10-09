#!/usr/bin/env python3
import csv
from collections import defaultdict

categories = set()
subcategories = defaultdict(set)

with open('productos_old_store.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cat_str = row.get('Categorías', '').strip()
        if cat_str and '>' in cat_str:
            parts = [p.strip() for p in cat_str.split('>')]
            if len(parts) >= 2:
                category = parts[0]
                subcategory = parts[1]
                categories.add(category)
                subcategories[category].add(subcategory)

print('=' * 70)
print('ANÁLISIS DE CATEGORÍAS Y SUBCATEGORÍAS EN EL CSV')
print('=' * 70)
print()

for category in sorted(categories):
    print(f'\n📁 {category}')
    for sub in sorted(subcategories[category]):
        print(f'   └─ {sub}')

print()
print('=' * 70)
print(f'Total categorías: {len(categories)}')
total_subs = sum(len(subs) for subs in subcategories.values())
print(f'Total subcategorías: {total_subs}')
print('=' * 70)
