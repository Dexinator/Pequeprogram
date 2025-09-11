#!/usr/bin/env python3
import json
import os
from pathlib import Path

def extract_svg_icons():
    # Read the selection.json file
    with open('catsandsubsEP-v1.0/selection.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
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
        'Stroller-EP': 'stroller-main',
        'Cradle-EP': 'cradle-main',
        'Food-EP': 'food-main',
        'Bath-EP': 'bath-main',
        'Dress-EP': 'dress-main'
    }
    
    # Extract each icon
    extracted_count = 0
    icon_components = []
    
    for icon in data['icons']:
        props = icon['properties']
        name = props['name']
        code = props.get('code', 0)
        
        # Get the paths from the icon data - correct structure
        if 'icon' in icon and 'paths' in icon['icon']:
            paths = icon['icon']['paths']
            
            # Get the English name or use original
            english_name = icon_mapping.get(name, name.lower().replace(' ', '-'))
            
            # Create SVG content from paths
            svg_paths = []
            for path in paths:
                svg_paths.append(f'  <path d="{path}" fill="currentColor"/>')
            
            svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="24" height="24">
{chr(10).join(svg_paths)}
</svg>'''
            
            # Save the SVG file
            svg_filename = output_dir / f"ep-{english_name}.svg"
            with open(svg_filename, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            extracted_count += 1
            print(f"Extracted: ep-{english_name}.svg (original: {name})")
            
            # Create React component for the icon
            component_name = english_name.replace('-', '_').title().replace('_', '')
            component = f'''// Icon: {name} -> {english_name}
export const Icon{component_name} = ({{ className = "", size = 24, color = "currentColor" }}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1024 1024" 
    width={{size}} 
    height={{size}}
    className={{className}}
  >
{chr(10).join(['    <path d="' + path + '" fill={color}/>' for path in paths])}
  </svg>
);
'''
            icon_components.append(component)
    
    # Create a React components file with all icons
    react_content = '''// Auto-generated icon components from Entrepeques icon font
// Generated from catsandsubsEP-v1.0

''' + '\n\n'.join(icon_components)
    
    react_file = output_dir / 'IconComponents.jsx'
    with open(react_file, 'w', encoding='utf-8') as f:
        f.write(react_content)
    
    print(f"\n✅ Successfully extracted {extracted_count} icons to {output_dir}")
    print(f"📝 Created React components at {output_dir}/IconComponents.jsx")
    
    # Create an index file with all icons for reference
    index_content = "# Entrepeques Icons\n\n"
    index_content += "| Original Name | English Name | File | Usage in Astro/HTML | Usage in React |\n"
    index_content += "|---------------|--------------|------|---------------------|----------------|\n"
    
    for name, english in icon_mapping.items():
        component_name = f"Icon{english.replace('-', '').title()}"
        index_content += f"| {name} | {english} | ep-{english}.svg | `<img src='/icons/ep-{english}.svg' />` | `<{component_name} />` |\n"
    
    with open(output_dir / 'ICONS_INDEX.md', 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    print(f"📋 Created icon index at {output_dir}/ICONS_INDEX.md")

if __name__ == "__main__":
    extract_svg_icons()