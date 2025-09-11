#!/usr/bin/env python3
import json
import xml.etree.ElementTree as ET
import os
from pathlib import Path

def extract_svg_icons():
    # Read the selection.json file
    with open('catsandsubsEP-v1.0/selection.json', 'r') as f:
        data = json.load(f)
    
    # Parse the SVG font file
    tree = ET.parse('catsandsubsEP-v1.0/fonts/catsandsubsEP.svg')
    root = tree.getroot()
    
    # Find all glyphs in the SVG font
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    glyphs = {}
    
    for glyph in root.findall('.//glyph'):
        unicode_val = glyph.get('unicode')
        if unicode_val:
            # Get the path data
            d = glyph.get('d')
            if d:
                glyphs[ord(unicode_val)] = d
    
    # Create output directory
    output_dir = Path('apps/tienda/public/icons')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Map of icon names to their usage in the app
    icon_mapping = {
        'juguetes': 'toys',
        'accesorios-dama': 'women-accessories',
        'calzado-nino': 'boys-footwear',
        'calzado-nina': 'girls-footwear',
        'procesador-alimentos': 'food-processor',
        'sillas-comer': 'high-chairs',
        'lactancia': 'breastfeeding',
        'andadera': 'walker',
        'cunas': 'cribs',
        'sobre-ruedas': 'wheels',
        'carriolas': 'strollers',
        'nina': 'girl',
        'nino': 'boy',
        'autoasiento': 'car-seat',
        'mecedora': 'rocking-chair',
        'libros': 'books',
        'accesorios-cunas': 'crib-accessories',
        'seguridad': 'safety',
        'ropa-dama': 'women-clothing',
        'correpasillos': 'ride-on',
        'otros-paseo': 'other-travel',
        'bano': 'bathroom',
        'disfraz': 'costume',
        'juegos-grandes': 'large-toys',
        'TRAINTHIN': 'train',
        'Stroller-EP': 'stroller-ep',
        'Cradle-EP': 'cradle-ep',
        'Food-EP': 'food-ep',
        'Bath-EP': 'bath-ep',
        'Dress-EP': 'dress-ep'
    }
    
    # Extract each icon
    extracted_count = 0
    for icon in data['icons']:
        props = icon['properties']
        name = props['name']
        code = props.get('code', 0)
        
        if code in glyphs:
            # Get the English name or use original
            english_name = icon_mapping.get(name, name.lower().replace(' ', '-'))
            
            # Create individual SVG file
            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="{glyphs[code]}" fill="currentColor" transform="scale(1, -1) translate(0, -512)"/>
</svg>'''
            
            # Save the SVG file
            svg_filename = output_dir / f"ep-{english_name}.svg"
            with open(svg_filename, 'w') as f:
                f.write(svg_content)
            
            extracted_count += 1
            print(f"Extracted: ep-{english_name}.svg (original: {name})")
    
    print(f"\n✅ Successfully extracted {extracted_count} icons to {output_dir}")
    
    # Create an index file with all icons for reference
    index_content = "# Entrepeques Icons\n\n"
    index_content += "| Original Name | English Name | File | Usage |\n"
    index_content += "|---------------|--------------|------|-------|\n"
    
    for name, english in icon_mapping.items():
        index_content += f"| {name} | {english} | ep-{english}.svg | `<img src='/icons/ep-{english}.svg' />` |\n"
    
    with open(output_dir / 'ICONS_INDEX.md', 'w') as f:
        f.write(index_content)
    
    print(f"📝 Created icon index at {output_dir}/ICONS_INDEX.md")

if __name__ == "__main__":
    extract_svg_icons()