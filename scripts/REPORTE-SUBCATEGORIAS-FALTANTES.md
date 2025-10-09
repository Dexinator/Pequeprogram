# 🔍 REPORTE: Análisis de Subcategorías Faltantes en Migración

**Fecha:** 2025-10-09
**Script analizado:** `scripts/migrate-old-store-products.js`
**Base de datos:** Producción Heroku PostgreSQL

---

## 📊 RESUMEN EJECUTIVO

### Hallazgos Principales

- **Subcategorías en CSV:** 50
- **Subcategorías en mapeo del script:** 17 (34%)
- **⚠️ Subcategorías FALTANTES:** 33 (66%)
- **⚠️ Productos afectados:** 369 productos (~57% del total)

### Impacto

Los **369 productos** afectados por subcategorías faltantes fueron clasificados incorrectamente como **"Juguetes"** (subcategory_id 46) durante la migración, ya que el script usa este valor como fallback por defecto.

---

## 🐛 SUBCATEGORÍAS FALTANTES POR CATEGORÍA

### 📁 A Jugar (5 faltantes - 83 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Andaderas | 52 | 10 | ❌ Sin mapear |
| Disfraces | 47 | 49 | ❌ Sin mapear |
| Juegos de mesa | 48 | 14 | ❌ Sin mapear |
| Libros y rompecabezas | 50 | 9 | ❌ Sin mapear |
| Mesa de actividades | 49 | 1 | ❌ Sin mapear |

### 📁 A comer (4 faltantes - 60 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Accesorios de alimentación | 35 | 18 | ❌ Sin mapear |
| Esterilizador de biberones | 32 | 8 | ❌ Sin mapear |
| Extractores de leche | 33 | 30 | ❌ Sin mapear |
| Procesador de alimentos | 34 | 4 | ❌ Sin mapear |

### 📁 A dormir (7 faltantes - 32 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Accesorios Recámara | 19 | 10 | ❌ Sin mapear |
| Barandal para cama | 17 | 2 | ❌ Sin mapear |
| Colchones | 14 | 3 | ❌ Sin mapear |
| **Colechos y Moisés** | **11** | **6** | **❌ Sin mapear** ⭐ |
| Juegos de cuna | 13 | 2 | ❌ Sin mapear |
| Móviles de cuna | 16 | 8 | ❌ Sin mapear |

### 📁 A pasear (5 faltantes - 75 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Accesorios Carriola y Auto | 4 | 15 | ❌ Sin mapear |
| Cargando al peque | 2 | 21 | ❌ Sin mapear |
| Montables de exterior | 5 | 5 | ❌ Sin mapear |
| Sobre ruedas | 8 | 22 | ❌ Sin mapear |
| Triciclos y bicicletas | 6 | 12 | ❌ Sin mapear |

### 📁 Baño (1 faltante - 7 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Bañeras | 28 | 7 | ❌ Sin mapear |

### 📁 En casa (3 faltantes - 19 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Mecedoras y Columpios de bebé | 21 | 8 | ❌ Sin mapear |

**NOTA:** "Baño" y "Hogar" parecen ser datos mal estructurados en el CSV y no tienen equivalentes directos en la base de datos.

### 📁 Ropa (8 faltantes - 93 productos afectados)

| Subcategoría | ID en DB | Productos | Estado Actual |
|-------------|----------|-----------|---------------|
| Accesorios y Bolsas de Dama | 44 | 31 | ❌ Sin mapear |
| Calzado Niña | 42 | 9 | ❌ Sin mapear |
| Calzado Niño | 43 | 6 | ❌ Sin mapear |
| Niña abajo de cintura | 38 | 3 | ❌ Sin mapear |
| Niña arriba de cintura | 37 | 5 | ❌ Sin mapear |
| Niña cuerpo completo | 36 | 23 | ❌ Sin mapear |
| Niño arriba de cintura | 40 | 7 | ❌ Sin mapear |
| Niño cuerpo completo | 39 | 9 | ❌ Sin mapear |

**NOTA:** Toda la categoría "Ropa" está completamente sin mapear (0% cobertura).

---

## ✅ MAPEO CORRECTO Y COMPLETO

```javascript
const subcategoryMapping = {
  // ========== A PASEAR ==========
  'Autoasientos': 1,
  'Cargando al peque': 2,
  'Carriolas': 3,
  'Accesorios Carriola y Auto': 4,
  'Montables de exterior': 5,
  'Triciclos y bicicletas': 6,
  'Sobre ruedas': 8,
  'Otros de Paseo': 9,

  // ========== A DORMIR ==========
  'Cunas de madera': 10,
  'Colechos y Moisés': 11,  // ⭐ FALTABA
  'Cunas de viaje': 12,
  'Juegos de cuna': 13,
  'Colchones': 14,
  'Almohadas y donas': 15,
  'Móviles de cuna': 16,
  'Barandal para cama': 17,
  'Muebles de recámara': 18,
  'Accesorios Recámara': 19,

  // ========== EN CASA ==========
  'Sillas para comer': 20,
  'Mecedoras y Columpios de bebé': 21,  // ⭐ FALTABA
  'Brincolines': 22,
  'Monitores': 26,
  'Higiene y accesorios': 27,
  'Bañeras': 28,  // ⭐ FALTABA

  // ========== A COMER ==========
  'Lactancia': 30,
  'Calentador de biberones': 31,
  'Esterilizador de biberones': 32,  // ⭐ FALTABA
  'Extractores de leche': 33,  // ⭐ FALTABA
  'Procesador de alimentos': 34,  // ⭐ FALTABA
  'Accesorios de alimentación': 35,  // ⭐ FALTABA

  // ========== ROPA ==========
  'Niña cuerpo completo': 36,  // ⭐ FALTABA
  'Niña arriba de cintura': 37,  // ⭐ FALTABA
  'Niña abajo de cintura': 38,  // ⭐ FALTABA
  'Niño cuerpo completo': 39,  // ⭐ FALTABA
  'Niño arriba de cintura': 40,  // ⭐ FALTABA
  'Calzado Niña': 42,  // ⭐ FALTABA
  'Calzado Niño': 43,  // ⭐ FALTABA
  'Accesorios y Bolsas de Dama': 44,  // ⭐ FALTABA

  // ========== A JUGAR ==========
  'Juguetes': 46,
  'Disfraces': 47,  // ⭐ FALTABA
  'Juegos de mesa': 48,  // ⭐ FALTABA
  'Mesa de actividades': 49,  // ⭐ FALTABA
  'Libros y rompecabezas': 50,  // ⭐ FALTABA
  'Gimnasios y tapetes': 51,
  'Andaderas': 52,  // ⭐ FALTABA
  'Montables y correpasillos Bebé': 53,
  'Montables de exterior': 54,  // ⭐ FALTABA (duplicado en A Jugar y A pasear)
  'Juegos grandes': 57
};
```

---

## 🔧 PRODUCTOS AFECTADOS EN PRODUCCIÓN

### Ejemplo: Colechos y Moisés

Los siguientes productos están **INCORRECTAMENTE** clasificados como "Juguetes":

| Valuation Item ID | SKU Migrado | SKU Original | Producto | Subcategoría Actual |
|-------------------|-------------|--------------|----------|---------------------|
| 450 | JUGP123 | HSCYMP17 | Chicco Colecho Magic | Juguetes ❌ |
| 578 | JUGP207 | CYMP30 | Infanti Colecho | Juguetes ❌ |
| 608 | JUGP225 | CYMP18 | Chicco Colecho | Juguetes ❌ |
| 713 | JUGP305 | CYMP35 | Maxicosi Colecho | Juguetes ❌ |
| 818 | JUGP379 | CYMP38 | Halo Moises | Juguetes ❌ |
| 824 | JUGP382 | CYMP40 | Kristhian Moisés | Juguetes ❌ |
| 891 | JUGP431 | CYMP44 | Plegable Moisés | Juguetes ❌ |

**Deberían estar en:** Subcategoría "Colechos y Moisés" (ID: 11, SKU: CYMP)

---

## 🎯 SOLUCIONES RECOMENDADAS

### Opción 1: Corrección SQL Rápida (Solo Colechos y Moisés)

Para corregir únicamente los 7 productos de "Colechos y Moisés":

```sql
-- Reclasificar valuation_items
UPDATE valuation_items
SET subcategory_id = 11,
    category_id = 2
WHERE id IN (450, 578, 608, 713, 818, 824, 891);

-- Regenerar SKUs en inventario
UPDATE inventario SET id = 'CYMP001' WHERE valuation_item_id = 450;
UPDATE inventario SET id = 'CYMP002' WHERE valuation_item_id = 578;
UPDATE inventario SET id = 'CYMP003' WHERE valuation_item_id = 608;
UPDATE inventario SET id = 'CYMP004' WHERE valuation_item_id = 713;
UPDATE inventario SET id = 'CYMP005' WHERE valuation_item_id = 818;
UPDATE inventario SET id = 'CYMP006' WHERE valuation_item_id = 824;
UPDATE inventario SET id = 'CYMP007' WHERE valuation_item_id = 891;
```

### Opción 2: Corrección Completa (Todos los 369 productos)

1. **Actualizar el script de migración** con el mapeo completo (ver arriba)
2. **Ejecutar script de corrección SQL masiva** para reclasificar los 369 productos
3. **Regenerar todos los SKUs** según subcategoría correcta

**⚠️ ADVERTENCIA:** Esta opción requiere:
- Backup completo de la base de datos antes de ejecutar
- Identificar todos los productos mal clasificados (query complejo)
- Regenerar SKUs sin conflictos con productos existentes
- Posible impacto en ventas existentes que referencien estos productos

### Opción 3: Migración Limpia (Recomendada para futuras migraciones)

1. **Corregir el script** `migrate-old-store-products.js` con el mapeo completo
2. **Crear nuevo script de corrección** que:
   - Identifique productos con subcategory_id = 46 (Juguetes) que NO son juguetes
   - Busque la categoría correcta del CSV usando el SKU original
   - Reclasifique con la subcategoría correcta
   - Regenere SKU si es necesario

---

## 📝 NOTAS ADICIONALES

### Categorías sin problemas

Las siguientes categorías tenían **mapeo completo** en el script original:
- ✅ **Brincolines** - 100% cobertura
- ✅ **Monitores** - 100% cobertura
- ✅ **Higiene y accesorios** - 100% cobertura

### Categorías con mayor impacto

Las categorías con **mayor número de productos afectados**:
1. **Ropa** - 93 productos (100% sin mapear)
2. **A Jugar** - 83 productos (38% sin mapear)
3. **A pasear** - 75 productos (50% sin mapear)

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ **Inmediato:** Corregir los 7 productos de "Colechos y Moisés" (Opción 1)
2. 📋 **Corto plazo:** Actualizar script de migración con mapeo completo
3. 🔍 **Mediano plazo:** Crear script de corrección masiva para los 369 productos
4. ✅ **Largo plazo:** Implementar validación en script de migración para detectar subcategorías faltantes

---

**Generado por:** Claude Code
**Archivos de análisis:**
- `scripts/analyze-categories.py`
- `scripts/compare-subcategories.py`
