# Iconos Entrepeques - Guía de Uso

## 📦 Extracción Completada

Se han extraído **30 iconos SVG** del icon font `catsandsubsEP-v1.0` y están disponibles en:

```
apps/tienda/public/icons/
```

## 🎨 Iconos Disponibles

### Categorías Principales
| Nombre Original | Nombre del Archivo | Uso Recomendado |
|----------------|-------------------|-----------------|
| juguetes | `ep-toys.svg` | Categoría "A jugar" |
| Stroller-EP | `ep-stroller-main.svg` | Categoría "A pasear" |
| Cradle-EP | `ep-cradle-main.svg` | Categoría "A dormir" |
| Food-EP | `ep-food-main.svg` | Categoría "A comer" |
| Dress-EP | `ep-dress-main.svg` | Categoría "Ropa" |
| seguridad | `ep-safety.svg` | Categoría "En Casa" |

### Subcategorías - Transporte
| Nombre | Archivo | Uso |
|--------|---------|-----|
| carriolas | `ep-strollers.svg` | Carriolas |
| autoasiento | `ep-car-seat.svg` | Autoasientos |
| correpasillos | `ep-ride-on.svg` | Correpasillos |
| sobre-ruedas | `ep-wheels.svg` | Sobre ruedas |
| otros-paseo | `ep-other-travel.svg` | Otros paseo |
| andadera | `ep-walker.svg` | Andaderas |

### Subcategorías - Dormir y Descanso
| Nombre | Archivo | Uso |
|--------|---------|-----|
| cunas | `ep-cribs.svg` | Cunas |
| mecedora | `ep-rocking-chair.svg` | Mecedoras |
| accesorios-cunas | `ep-crib-accessories.svg` | Accesorios cunas |

### Subcategorías - Alimentación
| Nombre | Archivo | Uso |
|--------|---------|-----|
| sillas-comer | `ep-high-chairs.svg` | Sillas para comer |
| procesador-alimentos | `ep-food-processor.svg` | Procesador alimentos |
| lactancia | `ep-breastfeeding.svg` | Lactancia |

### Subcategorías - Ropa y Calzado
| Nombre | Archivo | Uso |
|--------|---------|-----|
| ropa-dama | `ep-women-clothing.svg` | Ropa dama/maternidad |
| calzado-nino | `ep-boys-footwear.svg` | Calzado niño |
| calzado-nina | `ep-girls-footwear.svg` | Calzado niña |
| nina | `ep-girl.svg` | Ropa niña |
| nino | `ep-boy.svg` | Ropa niño |
| disfraz | `ep-costume.svg` | Disfraces |

### Subcategorías - Otros
| Nombre | Archivo | Uso |
|--------|---------|-----|
| bano | `ep-bathroom.svg` | Baño |
| libros | `ep-books.svg` | Libros |
| accesorios-dama | `ep-women-accessories.svg` | Accesorios dama |
| juegos-grandes | `ep-large-toys.svg` | Juegos grandes |

## 💻 Cómo Usar los Iconos

### 1. En componentes HTML/Astro

```html
<img
  src="/icons/ep-toys.svg"
  alt="Juguetes"
  width="32"
  height="32"
  loading="lazy"
/>
```

### 2. En componentes React/JSX

```jsx
// Importar el componente helper
import { CategoryIcon } from '../components/shop/CategoryIcons';

// Usar con nombre de categoría
<CategoryIcon
  categoryName="A pasear"
  size={48}
  className="text-blue-500"
/>
```

### 3. Componente React Personalizado

```jsx
const MyIcon = ({ iconName = 'toys', size = 24, className = '' }) => (
  <img
    src={`/icons/ep-${iconName}.svg`}
    alt=""
    width={size}
    height={size}
    className={className}
    loading="lazy"
  />
);

// Uso
<MyIcon iconName="stroller-main" size={32} className="text-pink-500" />
```

### 4. Con Tailwind CSS para colorear

Los SVGs usan `fill="currentColor"`, así que puedes colorearlos con clases de Tailwind:

```jsx
<img
  src="/icons/ep-toys.svg"
  className="w-10 h-10 text-brand-rosa"
  alt="Juguetes"
/>
```

## 🔄 Componentes Actualizados

### ✅ Componentes que ya usan los iconos SVG:

1. **`Categories.jsx`** - Sección de categorías con iconos personalizados por categoría
2. **`CategoriesStandalone.jsx`** - Versión standalone sin PageWrapper (página principal)
3. **`CategoryIcons.jsx`** - Componente helper nuevo para usar iconos fácilmente

### Mapeo de Categorías Actualizado:

```javascript
const categoryIconMapping = {
  'A pasear': 'stroller-main',
  'A dormir': 'cradle-main',
  'En Casa': 'safety',
  'A comer': 'food-main',
  'Ropa': 'dress-main',
  'A jugar': 'toys',
};
```

## 📝 Componentes React Exportados

Se generó automáticamente un archivo con componentes React:

```javascript
// apps/tienda/public/icons/IconComponents.jsx

import { IconToys, IconStrollerMain, IconCradleMain } from '/icons/IconComponents.jsx';

<IconToys size={32} color="currentColor" className="my-icon" />
```

## 🎯 Próximos Pasos

1. **Páginas de Categoría**: Actualizar las páginas individuales de categoría para usar los iconos
2. **Subcategorías**: Mapear subcategorías específicas a sus iconos correspondientes
3. **Cards de Producto**: Considerar agregar iconos pequeños en las cards de producto
4. **Breadcrumbs**: Usar iconos en la navegación de breadcrumbs

## 🚀 Testing

Para verificar que los iconos funcionan correctamente:

1. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Visitar la página principal: `http://localhost:4323`

3. Verificar la sección "Explora nuestras categorías" - debe mostrar los iconos SVG

4. Inspeccionar en DevTools que las imágenes cargan desde `/icons/ep-*.svg`

## 📖 Referencia Completa

Ver el archivo completo de referencia en:
```
apps/tienda/public/icons/ICONS_INDEX.md
```

---

**Última actualización**: 2025-10-02
**Iconos extraídos**: 30
**Formato**: SVG (1024x1024 viewBox)
**Fuente original**: catsandsubsEP-v1.0 (IcoMoon)
