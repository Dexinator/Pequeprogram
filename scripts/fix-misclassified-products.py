#!/usr/bin/env python3
"""
Script para corregir productos mal clasificados durante la migración.

Este script:
1. Lee el CSV original para obtener las categorías correctas
2. Consulta productos mal clasificados en producción
3. Genera y ejecuta SQLs de corrección
4. Regenera SKUs según subcategoría correcta
"""

import csv
import psycopg2
from collections import defaultdict
import sys

# Mapeo COMPLETO de subcategorías (nombre -> ID en base de datos)
SUBCATEGORY_MAPPING = {
    # ========== A PASEAR ==========
    'Autoasientos': 1,
    'Cargando al peque': 2,
    'Carriolas': 3,
    'Accesorios Carriola y Auto': 4,
    'Montables de exterior': 5,
    'Triciclos y bicicletas': 6,
    'Sobre ruedas': 8,
    'Otros de Paseo': 9,

    # ========== A DORMIR ==========
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

    # ========== EN CASA ==========
    'Sillas para comer': 20,
    'Mecedoras y Columpios de bebé': 21,
    'Brincolines': 22,
    'Monitores': 26,
    'Higiene y accesorios': 27,
    'Bañeras': 28,

    # ========== A COMER ==========
    'Lactancia': 30,
    'Calentador de biberones': 31,
    'Esterilizador de biberones': 32,
    'Extractores de leche': 33,
    'Procesador de alimentos': 34,
    'Accesorios de alimentación': 35,

    # ========== ROPA ==========
    'Niña cuerpo completo': 36,
    'Niña arriba de cintura': 37,
    'Niña abajo de cintura': 38,
    'Niño cuerpo completo': 39,
    'Niño arriba de cintura': 40,
    'Calzado Niña': 42,
    'Calzado Niño': 43,
    'Accesorios y Bolsas de Dama': 44,

    # ========== A JUGAR ==========
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
}

# Mapeo de categorías
CATEGORY_MAPPING = {
    'A pasear': 1,
    'A dormir': 2,
    'En casa': 3,
    'A comer': 4,
    'A Jugar': 6,
    'Baño': 3,  # Baño se mapea a "En Casa"
    'Ropa': 5
}

# Subcategoría a categoría (para lookup inverso)
SUBCATEGORY_TO_CATEGORY = {
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1,  # A pasear
    10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2,  # A dormir
    20: 3, 21: 3, 22: 3, 26: 3, 27: 3, 28: 3,  # En casa
    30: 4, 31: 4, 32: 4, 33: 4, 34: 4, 35: 4,  # A comer
    36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 42: 5, 43: 5, 44: 5,  # Ropa
    46: 6, 47: 6, 48: 6, 49: 6, 50: 6, 51: 6, 52: 6, 53: 6, 54: 6, 57: 6  # A jugar
}

# SKU prefixes por subcategoría
SUBCATEGORY_SKUS = {
    1: 'AUTP', 2: 'CAPP', 3: 'CARP', 4: 'ACAP', 5: 'MDEP', 6: 'TYBP', 8: 'SORP', 9: 'ODPP',
    10: 'CDMP', 11: 'CYMP', 12: 'CDVP', 13: 'JDCP', 14: 'COLP', 15: 'AYDP', 16: 'MDCP', 17: 'BPCP', 18: 'MDRP', 19: 'ACRP',
    20: 'SPCP', 21: 'MCBP', 22: 'BRIP', 26: 'MONP', 27: 'HYAP', 28: 'BANP',
    30: 'LACP', 31: 'CDBP', 32: 'EDBP', 33: 'EDLP', 34: 'PDAP', 35: 'ADAP',
    36: 'MCCP', 37: 'MACP', 38: 'MBCP', 39: 'HCCP', 40: 'HACP', 42: 'CMNP', 43: 'CHNP', 44: 'ABDP',
    46: 'JUGP', 47: 'DISP', 48: 'JDMP', 49: 'MDAP', 50: 'LYRP', 51: 'GYTP', 52: 'ANDP', 53: 'MCRP', 54: 'MDEP', 57: 'JGGP'
}


def read_csv_subcategories():
    """Lee el CSV y crea un mapa de SKU -> subcategoría correcta."""
    sku_to_subcategory = {}

    print("📖 Leyendo CSV original...")
    with open('productos_old_store.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sku = row.get('SKU', '').strip()
            if not sku:
                continue

            cat_str = row.get('Categorías', '').strip()
            if not cat_str or '>' not in cat_str:
                continue

            parts = [p.strip() for p in cat_str.split('>')]
            if len(parts) < 2:
                continue

            category = parts[0]
            subcategory = parts[1]

            # Normalizar caracteres mal codificados
            if '?' in subcategory:
                if 'Mois' in subcategory:
                    subcategory = 'Colechos y Moisés'
                elif 'Rec' in subcategory:
                    subcategory = 'Accesorios Recámara'
                elif 'Beb' in subcategory:
                    subcategory = 'Montables y correpasillos Bebé'

            # Verificar que la subcategoría esté en el mapeo
            if subcategory in SUBCATEGORY_MAPPING:
                subcategory_id = SUBCATEGORY_MAPPING[subcategory]
                category_id = SUBCATEGORY_TO_CATEGORY.get(subcategory_id)

                sku_to_subcategory[sku] = {
                    'subcategory_id': subcategory_id,
                    'category_id': category_id,
                    'subcategory_name': subcategory,
                    'product_name': row.get('Nombre', '')
                }

    print(f"✅ Procesados {len(sku_to_subcategory)} productos del CSV\n")
    return sku_to_subcategory


def connect_db():
    """Conecta a la base de datos de producción."""
    conn_string = "postgres://u5ctdlrr5k6j8r:pe1f4f515a5f9afc7e6f85cb5ece49d1952527402a05c9afd287bd371c0d2f679@c5p86clmevrg5s.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d5gshf3lbk7b4h"
    return psycopg2.connect(conn_string)


def find_misclassified_products(conn, sku_to_subcategory):
    """Encuentra productos mal clasificados en producción."""
    print("🔍 Buscando productos mal clasificados en producción...")

    cur = conn.cursor()

    # Obtener todos los productos con subcategory_id = 46 (Juguetes)
    cur.execute("""
        SELECT vi.id, vi.notes, vi.subcategory_id, vi.category_id,
               i.id as inventory_id, s.name as current_subcategory
        FROM valuation_items vi
        LEFT JOIN inventario i ON vi.id = i.valuation_item_id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        WHERE vi.subcategory_id = 46
        ORDER BY vi.id
    """)

    results = cur.fetchall()

    misclassified = []
    legitimate_toys = []
    unknown_skus = []

    for row in results:
        vi_id, notes, current_sub_id, current_cat_id, inventory_id, current_sub_name = row

        # Extraer SKU original del campo notes
        # Formato: "SKU Original: XXXX | Nombre"
        old_sku = None
        if notes and 'SKU' in notes:
            parts = notes.split('|')[0].strip()
            if ':' in parts:
                old_sku = parts.split(':')[1].strip().split()[0]

        if not old_sku:
            unknown_skus.append({
                'vi_id': vi_id,
                'notes': notes,
                'inventory_id': inventory_id
            })
            continue

        # Verificar si debería estar en otra categoría
        if old_sku in sku_to_subcategory:
            correct_data = sku_to_subcategory[old_sku]
            correct_sub_id = correct_data['subcategory_id']

            # Si la subcategoría correcta NO es Juguetes, está mal clasificado
            if correct_sub_id != 46:
                misclassified.append({
                    'vi_id': vi_id,
                    'old_sku': old_sku,
                    'inventory_id': inventory_id,
                    'current_sub_id': current_sub_id,
                    'current_cat_id': current_cat_id,
                    'correct_sub_id': correct_sub_id,
                    'correct_cat_id': correct_data['category_id'],
                    'correct_sub_name': correct_data['subcategory_name'],
                    'product_name': correct_data['product_name']
                })
            else:
                legitimate_toys.append(vi_id)
        else:
            unknown_skus.append({
                'vi_id': vi_id,
                'old_sku': old_sku,
                'notes': notes,
                'inventory_id': inventory_id
            })

    cur.close()

    print(f"✅ Análisis completado:")
    print(f"   - Total productos con subcategory_id=46: {len(results)}")
    print(f"   - Juguetes legítimos: {len(legitimate_toys)}")
    print(f"   - Mal clasificados: {len(misclassified)}")
    print(f"   - SKUs no encontrados en CSV: {len(unknown_skus)}\n")

    return misclassified, legitimate_toys, unknown_skus


def get_next_sku_number(conn, subcategory_id):
    """Obtiene el siguiente número de SKU disponible para una subcategoría."""
    sku_prefix = SUBCATEGORY_SKUS.get(subcategory_id, 'UNKN')

    cur = conn.cursor()
    cur.execute("""
        SELECT id FROM inventario
        WHERE id LIKE %s
        ORDER BY id DESC
        LIMIT 1
    """, (f"{sku_prefix}%",))

    result = cur.fetchone()
    cur.close()

    if result:
        last_sku = result[0]
        # Extraer el número al final
        import re
        match = re.search(r'(\d+)$', last_sku)
        if match:
            return int(match.group(1)) + 1

    return 1


def generate_correction_sqls(conn, misclassified):
    """Genera SQLs de corrección."""
    print("📝 Generando SQLs de corrección...\n")

    sql_updates = []
    sku_changes = []

    # Agrupar por subcategoría para tracking de números
    sku_counters = {}

    for product in misclassified:
        vi_id = product['vi_id']
        correct_sub_id = product['correct_sub_id']
        correct_cat_id = product['correct_cat_id']
        inventory_id = product['inventory_id']
        old_sku = product['old_sku']

        # SQL para actualizar valuation_items
        sql_updates.append(
            f"UPDATE valuation_items SET subcategory_id = {correct_sub_id}, category_id = {correct_cat_id} WHERE id = {vi_id};"
        )

        # Generar nuevo SKU para inventario si existe
        if inventory_id:
            if correct_sub_id not in sku_counters:
                sku_counters[correct_sub_id] = get_next_sku_number(conn, correct_sub_id)

            new_sku_number = sku_counters[correct_sub_id]
            sku_prefix = SUBCATEGORY_SKUS[correct_sub_id]
            new_sku = f"{sku_prefix}{str(new_sku_number).zfill(3)}"

            # Verificar que el nuevo SKU no existe
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM inventario WHERE id = %s", (new_sku,))
            if cur.fetchone():
                # Si existe, incrementar hasta encontrar uno disponible
                while True:
                    new_sku_number += 1
                    new_sku = f"{sku_prefix}{str(new_sku_number).zfill(3)}"
                    cur.execute("SELECT 1 FROM inventario WHERE id = %s", (new_sku,))
                    if not cur.fetchone():
                        break
            cur.close()

            sql_updates.append(
                f"UPDATE inventario SET id = '{new_sku}' WHERE id = '{inventory_id}';"
            )

            sku_changes.append({
                'old': inventory_id,
                'new': new_sku,
                'original_sku': old_sku,
                'product': product['product_name']
            })

            sku_counters[correct_sub_id] = new_sku_number + 1

    return sql_updates, sku_changes


def main():
    print("=" * 80)
    print("🔧 CORRECCIÓN MASIVA DE PRODUCTOS MAL CLASIFICADOS")
    print("=" * 80)
    print()

    # Paso 1: Leer CSV
    sku_to_subcategory = read_csv_subcategories()

    # Paso 2: Conectar a base de datos
    print("🔌 Conectando a base de datos de producción...")
    conn = connect_db()
    print("✅ Conectado exitosamente\n")

    # Paso 3: Encontrar productos mal clasificados
    misclassified, legitimate_toys, unknown_skus = find_misclassified_products(conn, sku_to_subcategory)

    if not misclassified:
        print("✨ ¡No hay productos mal clasificados! Todo está correcto.")
        conn.close()
        return

    # Paso 4: Mostrar resumen por subcategoría
    print("📊 RESUMEN POR SUBCATEGORÍA CORRECTA:")
    print("-" * 80)
    by_subcategory = defaultdict(list)
    for p in misclassified:
        by_subcategory[p['correct_sub_name']].append(p)

    for sub_name in sorted(by_subcategory.keys()):
        products = by_subcategory[sub_name]
        print(f"   {sub_name:40} - {len(products):3} productos")

    print()
    print("-" * 80)
    print(f"TOTAL A CORREGIR: {len(misclassified)} productos")
    print("-" * 80)
    print()

    # Paso 5: Pedir confirmación
    response = input("¿Deseas generar los SQLs de corrección? (sí/no): ").lower()
    if response not in ['sí', 'si', 's', 'yes', 'y']:
        print("❌ Operación cancelada")
        conn.close()
        return

    # Paso 6: Generar SQLs
    sql_updates, sku_changes = generate_correction_sqls(conn, misclassified)

    # Paso 7: Guardar SQLs en archivo
    with open('scripts/correction-sqls.sql', 'w', encoding='utf-8') as f:
        f.write("-- CORRECCIÓN MASIVA DE PRODUCTOS MAL CLASIFICADOS\n")
        f.write("-- Generado automáticamente\n")
        f.write(f"-- Total de updates: {len(sql_updates)}\n\n")
        f.write("BEGIN;\n\n")

        for sql in sql_updates:
            f.write(sql + "\n")

        f.write("\nCOMMIT;\n")

    print(f"✅ SQLs generados: scripts/correction-sqls.sql ({len(sql_updates)} statements)")

    # Guardar mapeo de SKUs
    with open('scripts/sku-corrections.txt', 'w', encoding='utf-8') as f:
        f.write("MAPEO DE CORRECCIÓN DE SKUs\n")
        f.write("=" * 80 + "\n\n")
        for change in sku_changes:
            f.write(f"{change['old']:15} → {change['new']:15} | Original: {change['original_sku']:15} | {change['product']}\n")

    print(f"✅ Mapeo de SKUs: scripts/sku-corrections.txt ({len(sku_changes)} cambios)\n")

    # Paso 8: Preguntar si ejecutar
    response = input("¿Deseas EJECUTAR las correcciones en PRODUCCIÓN? (sí/no): ").lower()
    if response not in ['sí', 'si', 's', 'yes', 'y']:
        print("⚠️  Correcciones NO ejecutadas. Revisa los archivos generados.")
        conn.close()
        return

    # Paso 9: Ejecutar correcciones
    print("\n🚀 Ejecutando correcciones...")
    cur = conn.cursor()

    try:
        for i, sql in enumerate(sql_updates, 1):
            cur.execute(sql)
            if i % 50 == 0:
                print(f"   Procesados {i}/{len(sql_updates)}...")

        conn.commit()
        print(f"✅ {len(sql_updates)} correcciones aplicadas exitosamente!")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error durante la ejecución: {e}")
        print("   Se hizo ROLLBACK. No se aplicaron cambios.")
    finally:
        cur.close()
        conn.close()

    print("\n" + "=" * 80)
    print("✨ PROCESO COMPLETADO")
    print("=" * 80)


if __name__ == "__main__":
    main()
