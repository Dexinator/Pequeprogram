#!/usr/bin/env python3
import csv
from collections import defaultdict

# Mapeo del script de migración (migrate-old-store-products.js líneas 26-53)
script_mapping = {
    # A pasear
    'Autoasientos': 1,
    'Carriolas': 3,
    'Otros de Paseo': 9,

    # A dormir
    'Cunas de madera': 10,
    'Cunas de viaje': 12,
    'Muebles de recámara': 18,
    'Almohadas y donas': 15,

    # En casa
    'Sillas para comer': 20,
    'Brincolines': 22,
    'Monitores': 26,
    'Higiene y accesorios': 27,

    # A comer
    'Lactancia': 30,
    'Calentador de biberones': 31,

    # A jugar
    'Juguetes': 46,
    'Juegos grandes': 57,
    'Montables y correpasillos Bebé': 53,
    'Gimnasios y tapetes': 51
}

# Extraer subcategorías del CSV
csv_subcategories = defaultdict(set)
product_counts = defaultdict(int)

with open('productos_old_store.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cat_str = row.get('Categorías', '').strip()
        if cat_str and '>' in cat_str:
            parts = [p.strip() for p in cat_str.split('>')]
            if len(parts) >= 2:
                category = parts[0]
                subcategory = parts[1]

                # Normalizar algunas variantes
                if '?' in subcategory:  # Caracteres mal codificados
                    continue
                if category not in ['A pasear', 'A dormir', 'A comer', 'A Jugar', 'En casa', 'Baño', 'Ropa']:
                    continue  # Saltar categorías malformadas

                csv_subcategories[category].add(subcategory)
                key = f"{category} > {subcategory}"
                product_counts[key] += 1

print('=' * 80)
print('COMPARACIÓN: SUBCATEGORÍAS EN CSV vs MAPEO DEL SCRIPT')
print('=' * 80)
print()

# Analizar por categoría
for category in sorted(csv_subcategories.keys()):
    subs = sorted(csv_subcategories[category])

    print(f'\n📁 {category}')
    print('-' * 80)

    missing = []
    mapped = []

    for sub in subs:
        count = product_counts[f"{category} > {sub}"]
        if sub in script_mapping:
            status = '✅ MAPEADA'
            mapped.append((sub, count))
        else:
            status = '❌ FALTANTE'
            missing.append((sub, count))

        print(f'   {status:15} {sub:40} ({count} productos)')

    if missing:
        print(f'\n   ⚠️  TOTAL FALTANTES: {len(missing)} subcategorías, {sum(c for _, c in missing)} productos afectados')

print()
print('=' * 80)
print('RESUMEN GENERAL')
print('=' * 80)

total_csv = sum(len(subs) for subs in csv_subcategories.values())
total_mapped = len(script_mapping)
all_missing = []

for category in csv_subcategories:
    for sub in csv_subcategories[category]:
        if sub not in script_mapping:
            count = product_counts[f"{category} > {sub}"]
            all_missing.append((category, sub, count))

print(f'\n📊 Subcategorías en CSV: {total_csv}')
print(f'📊 Subcategorías en mapeo del script: {total_mapped}')
print(f'⚠️  Subcategorías FALTANTES: {len(all_missing)}')
print(f'⚠️  Productos afectados: {sum(c for _, _, c in all_missing)}')

print()
print('=' * 80)
print('LISTA COMPLETA DE SUBCATEGORÍAS FALTANTES')
print('=' * 80)
print()

for category, sub, count in sorted(all_missing, key=lambda x: -x[2]):
    print(f"  '{sub}': TODO,  // {category} - {count} productos")

print()
print('=' * 80)
