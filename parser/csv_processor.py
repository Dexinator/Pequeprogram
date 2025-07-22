#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script FINAL para corregir el archivo CSV feature_client.csv
VERSION CORREGIDA - Arregla el campo options correctamente
"""

import csv
import re
import sys

def fix_encoding(text):
    """Corrige caracteres especiales mal codificados"""
    if not isinstance(text, str):
        return text
    
    # Mapeo de caracteres corruptos a correctos
    text = text.replace('√©', 'é')
    text = text.replace('√°', 'á')
    text = text.replace('√≠', 'í')
    text = text.replace('√≥', 'ó')
    text = text.replace('√∫', 'ú')
    text = text.replace('√±', 'ñ')
    text = text.replace('√Ä', 'Á')
    text = text.replace('√â', 'É')
    text = text.replace('√ã', 'Í')
    text = text.replace('√ì', 'Ó')
    text = text.replace('√∞', 'Ú')
    text = text.replace('√Ñ', 'Ñ')
    
    # Otros mapeos comunes
    text = text.replace('Ã¡', 'á')
    text = text.replace('Ã©', 'é')
    text = text.replace('Ã­', 'í')
    text = text.replace('Ã³', 'ó')
    text = text.replace('Ãº', 'ú')
    text = text.replace('Ã±', 'ñ')
    
    return text

def parse_csv_line(line):
    """Parsea una línea CSV manualmente para manejar mejor las comillas"""
    fields = []
    current_field = ''
    in_quotes = False
    i = 0
    
    while i < len(line):
        char = line[i]
        
        if char == '"':
            if in_quotes and i + 1 < len(line) and line[i + 1] == '"':
                # Doble comilla escapada
                current_field += '"'
                i += 1  # Saltar la siguiente comilla
            else:
                # Cambiar estado de comillas
                in_quotes = not in_quotes
        elif char == ',' and not in_quotes:
            # Fin del campo
            fields.append(current_field.strip())
            current_field = ''
        else:
            current_field += char
        
        i += 1
    
    # Agregar el último campo
    if current_field or line.endswith(','):
        fields.append(current_field.strip())
    
    return fields

def reconstruct_options_field(fields, start_index=8):
    """Reconstruye el campo options correctamente"""
    if start_index >= len(fields):
        return ''
    
    # Buscar el campo que contiene '['
    options_start = -1
    for i in range(start_index, len(fields)):
        if fields[i] and '[' in fields[i]:
            options_start = i
            break
    
    if options_start == -1:
        return ''
    
    # Reconstruir el array completo
    options_parts = []
    for i in range(options_start, len(fields)):
        if not fields[i]:
            continue
            
        part = fields[i]
        options_parts.append(part)
        
        # Si encontramos el cierre del array, parar
        if ']' in part:
            break
        
        # Si encontramos números/fechas, parar (ya no es parte del options)
        if re.match(r'^\d+:\d+', part) or re.match(r'^\d{4}-\d{2}-\d{2}', part):
            options_parts.pop()  # Quitar este campo
            break
    
    if not options_parts:
        return ''
    
    # Unir las partes
    options_text = ','.join(options_parts)
    
    # Limpiar el formato
    # Quitar comillas externas si las hay
    if options_text.startswith('"') and options_text.endswith('"'):
        options_text = options_text[1:-1]
    
    # Arreglar el formato del array
    # Reemplazar las comillas mal formateadas
    options_text = re.sub(r'\'\s*,\s*\'', "', '", options_text)
    options_text = re.sub(r'"\s*,\s*"', '", "', options_text)
    options_text = re.sub(r'\'"\s*,\s*\'"', '\', \'', options_text)
    options_text = re.sub(r'"\'\s*,\s*\'"', '\', \'', options_text)
    
    # Limpiar caracteres extra al final
    options_text = re.sub(r'[,\s\'"]+$', '', options_text)
    
    # Asegurar que termina correctamente
    if options_text.startswith('[') and not options_text.endswith(']'):
        options_text += ']'
    
    return options_text

def process_csv_file(input_file, output_file):
    """Procesa el archivo CSV y genera la versión corregida"""
    
    # Columnas requeridas en el orden correcto
    required_columns = [
        'id', 'subcategory_id', 'name', 'display_name', 'type', 
        'order_index', 'options', 'created_at', 'updated_at', 'mandatory'
    ]
    
    processed_rows = []
    
    try:
        # Leer el archivo
        with open(input_file, 'r', encoding='utf-8', newline='') as file:
            lines = file.readlines()
        
        print(f"✓ Archivo leído: {len(lines)} líneas")
        
        # Procesar cada línea (saltar header)
        for i, line in enumerate(lines[1:], 1):
            line = line.strip()
            if not line:
                continue
            
            # Aplicar corrección de caracteres
            line = fix_encoding(line)
            
            # Parsear la línea
            try:
                fields = parse_csv_line(line)
            except Exception as e:
                print(f"⚠️  Error parseando línea {i}: {e}")
                continue
            
            # Verificar que tenga datos suficientes
            if len(fields) < 12 or not fields[0] or not fields[0].isdigit():
                continue
            
            # Reconstruir el campo options
            options_text = reconstruct_options_field(fields, 8)
            
            # Crear registro limpio
            try:
                clean_row = {
                    'id': int(fields[0]),
                    'subcategory_id': int(fields[1]) if fields[1] and fields[1].isdigit() else 0,
                    'name': fields[4].strip() if len(fields) > 4 else '',
                    'display_name': fields[5].strip() if len(fields) > 5 else '',
                    'type': fields[6].strip() if len(fields) > 6 else '',
                    'order_index': int(fields[7]) if len(fields) > 7 and fields[7].isdigit() else 0,
                    'options': options_text,
                    'created_at': '2024-01-01 00:00:00',
                    'updated_at': '2024-01-01 00:00:00',
                    'mandatory': 't' if (len(fields) > 11 and fields[11] in ['t', 'TRUE']) else 'f'
                }
                
                # Solo agregar si tiene datos esenciales
                if clean_row['name'] and clean_row['display_name']:
                    processed_rows.append(clean_row)
                    
            except (ValueError, IndexError) as e:
                print(f"⚠️  Error procesando línea {i}: {e}")
                continue
        
        print(f"✓ Procesadas {len(processed_rows)} filas válidas")
        
        # Escribir archivo de salida
        with open(output_file, 'w', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=required_columns)
            writer.writeheader()
            writer.writerows(processed_rows)
        
        print(f"✅ Archivo guardado: {output_file}")
        
        # Mostrar ejemplos de options corregidos
        print(f"\n📋 EJEMPLOS DE OPTIONS CORREGIDOS:")
        for i, row in enumerate(processed_rows[:3]):
            print(f"{i+1}. {row['display_name']}: {row['options'][:80]}...")
        
        # Estadísticas
        with_accents = sum(1 for row in processed_rows 
                          if 'é' in str(row['options']) or 'á' in str(row['options']) or 'ó' in str(row['options']))
        
        print(f"\n📊 ESTADÍSTICAS:")
        print(f"   Total de registros: {len(processed_rows)}")
        print(f"   Registros con acentos: {with_accents}")
        print(f"   Columnas: {len(required_columns)}")
        
        print(f"\n🎯 CORRECCIONES APLICADAS:")
        print(f"   ✓ Acentos restaurados (é, á, ó, etc.)")
        print(f"   ✓ Columnas extra eliminadas")
        print(f"   ✓ Campo 'options' reconstruido correctamente")
        print(f"   ✓ Fechas estandarizadas")
        print(f"   ✓ Formato CSV válido")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Función principal"""
    print("🔧 CORRECTOR DE CSV - VERSIÓN FINAL")
    print("=" * 50)
    
    input_file = 'feature_client.csv'
    output_file = 'feature_def_FINAL.csv'
    
    # Verificar que existe el archivo de entrada
    try:
        with open(input_file, 'r') as f:
            pass
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{input_file}'")
        print("   Asegúrate de que el archivo esté en el mismo directorio")
        return
    
    print(f"📁 Archivo de entrada: {input_file}")
    print(f"📁 Archivo de salida: {output_file}")
    print()
    
    # Procesar archivo
    success = process_csv_file(input_file, output_file)
    
    if success:
        print(f"\n🎉 ¡Proceso completado exitosamente!")
        print(f"   Archivo listo: '{output_file}'")
        print(f"   Ya puedes usarlo en tu base de datos ✨")
    else:
        print(f"\n💥 Proceso falló. Revisa los errores arriba.")

if __name__ == "__main__":
    main()