# 📊 REPORTE: Estructura de Categorías y Grupos - Entrepeques Tienda Online

**Fecha de generación**: 2025-01-13
**Archivo fuente**: `apps/tienda/src/data/categoryGroupsComplete.js`
**Base de datos**: Producción (PostgreSQL en Heroku)

---

## 📋 RESUMEN EJECUTIVO

- **Total de categorías principales**: 6
- **Total de grupos**: 25
- **Total de subcategorías en BD**: 57
- **Productos online disponibles**: ~515 productos
- **Total de items en inventario**: ~642 items

---

## 🏷️ CATEGORÍA 1: A PASEAR
**Category ID**: 1
**Slug**: `a-pasear`
**Total de grupos**: 4

### Grupo 1.1: Autoasientos 🚗
**Tipo**: Agrupado (grouped)
**Slug**: `autoasientos`
**URL**: `/categoria/a-pasear` → Click en "Autoasientos"

**Subcategorías incluidas**:
- Portabebé 0-13 kg *(búsqueda por palabra clave)*
- Autoasientos 0-18 a 30 kg *(búsqueda por palabra clave)*
- Booster 0-18 a 49 Kg *(búsqueda por palabra clave)*

**Subcategoría real en BD**:
- ✅ **Autoasientos**: 20 productos online | 29 items totales

---

### Grupo 1.2: Carriolas 👶
**Tipo**: Agrupado (grouped)
**Slug**: `carriolas`

**Subcategorías incluidas**:
- Con Portabebé *(búsqueda por palabra clave)*
- Sin Portabebé *(búsqueda por palabra clave)*
- Doble *(búsqueda por palabra clave)*

**Subcategoría real en BD**:
- ✅ **Carriolas**: 26 productos online | 33 items totales

---

### Grupo 1.3: Sobre Ruedas 🛴
**Tipo**: Agrupado (grouped)
**Slug**: `sobre-ruedas`

**Subcategorías incluidas**:
- Sobre ruedas
- Montables de exterior
- Triciclos y bicicletas
- Sillas para bicicleta

**Subcategorías reales en BD**:
- ✅ **Sobre ruedas**: 16 productos online | 22 items totales
- ⚠️ **Montables de exterior**: 0 productos online | 0 items totales
- ✅ **Triciclos y bicicletas**: 15 productos online | 20 items totales
- ✅ **Sillas para bicicleta**: 1 producto online | 1 item total

**Total del grupo**: 32 productos

---

### Grupo 1.4: Otros de paseo 🧳
**Tipo**: Simple (single)
**Slug**: `otros-paseo`

**Subcategorías reales en BD**:
- ✅ **Otros de Paseo**: 23 productos online | 28 items totales
- ✅ **Cargando al peque**: 17 productos online | 23 items totales
- ✅ **Accesorios Carriola y Auto**: 15 productos online | 15 items totales

**Total del grupo**: ~55 productos

**TOTAL CATEGORÍA "A PASEAR"**: 133 productos online

---

## 🛏️ CATEGORÍA 2: A DORMIR
**Category ID**: 2
**Slug**: `a-dormir`
**Total de grupos**: 2

### Grupo 2.1: Cunas, colechos y muebles 🛏️
**Tipo**: Agrupado (grouped)
**Slug**: `cunas-colechos-muebles`

**Subcategorías incluidas**:
- Cunas de madera
- Cunas de viaje
- Colechos y Moisés
- Muebles de recámara

**Subcategorías reales en BD**:
- ✅ **Cunas de madera**: 12 productos online | 16 items totales
- ✅ **Cunas de viaje**: 12 productos online | 13 items totales
- ✅ **Colechos y Moisés**: 8 productos online | 9 items totales
- ✅ **Muebles de recámara**: 2 productos online | 2 items totales

**Total del grupo**: 34 productos

---

### Grupo 2.2: Accesorios de cunas, colchones y almohadas 🧸
**Tipo**: Agrupado (grouped)
**Slug**: `accesorios-cunas`

**Subcategorías incluidas**:
- Juegos de cuna
- Colchones
- Almohadas y donas
- Móviles de cuna
- Barandal para cama
- Accesorios recámara

**Subcategorías reales en BD**:
- ✅ **Juegos de cuna**: 2 productos online | 3 items totales
- ✅ **Colchones**: 1 producto online | 13 items totales
- ✅ **Almohadas y donas**: 11 productos online | 12 items totales
- ✅ **Móviles de cuna**: 8 productos online | 8 items totales
- ✅ **Barandal para cama**: 2 productos online | 7 items totales
- ✅ **Accesorios Recámara**: 11 productos online | 11 items totales

**Total del grupo**: 35 productos

**TOTAL CATEGORÍA "A DORMIR"**: 69 productos online

---

## 🏠 CATEGORÍA 3: EN CASA
**Category ID**: 3
**Slug**: `en-casa`
**Total de grupos**: 5

### Grupo 3.1: Sillas para comer 🪑
**Tipo**: Simple (single)
**Slug**: `sillas-comer`

**Subcategorías reales en BD**:
- ✅ **Sillas para comer**: 16 productos online | 24 items totales

---

### Grupo 3.2: Mecedoras y Columpios de bebé 🪑
**Tipo**: Simple (single)
**Slug**: `mecedoras-columpios`

**Subcategorías reales en BD**:
- ✅ **Mecedoras y Columpios de bebé**: 5 productos online | 11 items totales

---

### Grupo 3.3: Brincolines y Corrales 🤸
**Tipo**: Agrupado (grouped)
**Slug**: `brincolines-corrales`

**Subcategorías incluidas**:
- Brincolines
- Corrales

**Subcategorías reales en BD**:
- ✅ **Brincolines**: 6 productos online | 8 items totales
- ✅ **Corrales**: 2 productos online | 2 items totales

**Total del grupo**: 8 productos

---

### Grupo 3.4: Seguridad 🔒
**Tipo**: Simple (single)
**Slug**: `seguridad`

**Subcategorías reales en BD**:
- ⚠️ **Protectores y seguros**: 0 productos online | 0 items totales
- ⚠️ **Puertas de seguridad**: 0 productos online | 0 items totales
- ✅ **Monitores**: 5 productos online | 5 items totales

**Total del grupo**: 5 productos

---

### Grupo 3.5: Baño y Accesorios 🛁
**Tipo**: Simple (single)
**Slug**: `bano-accesorios`

**Subcategorías reales en BD**:
- ✅ **Bañeras**: 6 productos online | 7 items totales
- ✅ **Higiene y accesorios**: 13 productos online | 18 items totales
- ⚠️ **Pañales**: 0 productos online | 0 items totales

**Total del grupo**: 19 productos

**TOTAL CATEGORÍA "EN CASA"**: 53 productos online

---

## 🍼 CATEGORÍA 4: A COMER
**Category ID**: 4
**Slug**: `a-comer`
**Total de grupos**: 2

### Grupo 4.1: Lactancia 🍼
**Tipo**: Simple (single)
**Slug**: `lactancia`

**Subcategorías reales en BD**:
- ✅ **Lactancia**: 8 productos online | 9 items totales
- ✅ **Calentador de biberones**: 9 productos online | 9 items totales
- ✅ **Esterilizador de biberones**: 8 productos online | 10 items totales
- ✅ **Extractores de leche**: 30 productos online | 31 items totales
- ✅ **Accesorios de alimentación**: 18 productos online | 18 items totales

**Total del grupo**: 73 productos

---

### Grupo 4.2: Procesador de alimentos 🍽️
**Tipo**: Simple (single)
**Slug**: `procesador-alimentos`

**Subcategorías reales en BD**:
- ✅ **Procesador de alimentos**: 4 productos online | 4 items totales

**TOTAL CATEGORÍA "A COMER"**: 77 productos online

---

## 👗 CATEGORÍA 5: ROPA
**Category ID**: 5
**Slug**: `ropa`
**Total de grupos**: 5

### Grupo 5.1: Niña 👧
**Tipo**: Simple (single)
**Slug**: `nina`

**Subcategorías reales en BD**:
- ✅ **Niña cuerpo completo**: 23 productos online | 27 items totales
- ✅ **Niña arriba de cintura**: 6 productos online | 8 items totales
- ✅ **Niña abajo de cintura**: 3 productos online | 5 items totales

**Total del grupo**: 32 productos

---

### Grupo 5.2: Calzado Niña 👟
**Tipo**: Simple (single)
**Slug**: `calzado-nina`

**Subcategorías reales en BD**:
- ✅ **Calzado Niña**: 9 productos online | 12 items totales

---

### Grupo 5.3: Niño 👦
**Tipo**: Simple (single)
**Slug**: `nino`

**Subcategorías reales en BD**:
- ✅ **Niño cuerpo completo**: 9 productos online | 9 items totales
- ✅ **Niño arriba de cintura**: 7 productos online | 8 items totales
- ⚠️ **Niño abajo de cintura**: 0 productos online | 1 item total

**Total del grupo**: 16 productos

---

### Grupo 5.4: Calzado Niño 👞
**Tipo**: Simple (single)
**Slug**: `calzado-nino`

**Subcategorías reales en BD**:
- ✅ **Calzado Niño**: 8 productos online | 8 items totales

---

### Grupo 5.5: Ropa de Dama y Maternidad 🤰
**Tipo**: Agrupado (grouped)
**Slug**: `ropa-dama-maternidad`

**Subcategorías incluidas**:
- Ropa de Dama
- Ropa de Maternidad

**Subcategorías reales en BD**:
- ⚠️ **Ropa de Dama y Maternidad**: 0 productos online | 0 items totales
- ✅ **Accesorios y Bolsas de Dama**: 31 productos online | 31 items totales

**Total del grupo**: 31 productos

**TOTAL CATEGORÍA "ROPA"**: 96 productos online

---

## 🎮 CATEGORÍA 6: A JUGAR
**Category ID**: 6
**Slug**: `a-jugar`
**Total de grupos**: 7

### Grupo 6.1: Juguetes (por edad) 🧸
**Tipo**: Agrupado (grouped)
**Slug**: `juguetes-edad`

**Subcategorías incluidas**:
- 0-12 meses *(búsqueda en features)*
- 1-3 años *(búsqueda en features)*
- 3-5 años *(búsqueda en features)*
- 5+ años *(búsqueda en features)*

**Subcategoría real en BD**:
- ✅ **Juguetes**: 82 productos online | 84 items totales

---

### Grupo 6.2: Disfraces (por edad) 🎭
**Tipo**: Agrupado (grouped)
**Slug**: `disfraces-edad`

**Subcategorías incluidas**:
- 0-12 meses *(búsqueda en features)*
- 1-3 años *(búsqueda en features)*
- 3-5 años *(búsqueda en features)*
- 5+ años *(búsqueda en features)*

**Subcategoría real en BD**:
- ✅ **Disfraces**: 49 productos online | 49 items totales

---

### Grupo 6.3: Andaderas 🚶
**Tipo**: Simple (single)
**Slug**: `andaderas`

**Subcategorías reales en BD**:
- ✅ **Andaderas**: 11 productos online | 11 items totales

---

### Grupo 6.4: Correpasillos, mesas y tapetes 🎨
**Tipo**: Agrupado (grouped)
**Slug**: `correpasillos-mesas`

**Subcategorías incluidas**:
- Correpasillos
- Mesas de actividades
- Tapetes didácticos

**Subcategorías reales en BD**:
- ✅ **Montables y correpasillos Bebé**: 12 productos online | 12 items totales
- ✅ **Mesa de actividades**: 1 producto online | 1 item total
- ✅ **Gimnasios y tapetes**: 15 productos online | 15 items totales

**Total del grupo**: 28 productos

---

### Grupo 6.5: Libros y juegos de mesa 📚
**Tipo**: Agrupado (grouped)
**Slug**: `libros-juegos`

**Subcategorías incluidas**:
- Libros infantiles
- Juegos de mesa
- Rompecabezas

**Subcategorías reales en BD**:
- ✅ **Libros y rompecabezas**: 9 productos online | 9 items totales
- ✅ **Juegos de mesa**: 14 productos online | 14 items totales

**Total del grupo**: 23 productos

---

### Grupo 6.6: Juegos Grandes 🎪
**Tipo**: Simple (single)
**Slug**: `juegos-grandes`

**Subcategorías reales en BD**:
- ✅ **Juegos grandes**: 12 productos online | 16 items totales

---

### Grupo 6.7: Sobre Ruedas 🚲
**Tipo**: Agrupado (grouped)
**Slug**: `sobre-ruedas-jugar`

**Subcategorías incluidas**:
- Sobre ruedas
- Montables de exterior
- Triciclos y bicicletas

**Subcategorías reales en BD**:
- ⚠️ **Sobre ruedas** (A jugar): 0 productos online | 0 items totales
- ✅ **Montables de exterior** (A jugar): 5 productos online | 5 items totales
- ⚠️ **Triciclos y bicicletas** (A jugar): 0 productos online | 0 items totales

**Total del grupo**: 5 productos

**TOTAL CATEGORÍA "A JUGAR"**: 210 productos online

---

## 📈 RESUMEN POR CATEGORÍA

| Categoría | Grupos | Productos Online | % del Total |
|-----------|--------|------------------|-------------|
| **A pasear** | 4 | 133 | 25.8% |
| **A dormir** | 2 | 69 | 13.4% |
| **En casa** | 5 | 53 | 10.3% |
| **A comer** | 2 | 77 | 15.0% |
| **Ropa** | 5 | 96 | 18.6% |
| **A jugar** | 7 | 210 | 40.8% |
| **TOTAL** | **25** | **515+** | **100%** |

---

## ⚠️ SUBCATEGORÍAS SIN PRODUCTOS

Las siguientes subcategorías existen en la base de datos pero **NO tienen productos online**:

### A pasear (1):
- Montables de exterior (0 productos)

### En casa (3):
- Pañales (0 productos)
- Protectores y seguros (0 productos)
- Puertas de seguridad (0 productos)

### Ropa (2):
- Niño abajo de cintura (0 productos online, 1 item total)
- Ropa de Dama y Maternidad (0 productos)

### A jugar (2):
- Sobre ruedas (A jugar) (0 productos)
- Triciclos y bicicletas (A jugar) (0 productos)

**Total**: 8 subcategorías sin productos online (14% del total)

---

## 🔍 NOTAS IMPORTANTES

### 1. Subcategorías duplicadas en BD (VÁLIDAS):
Estas subcategorías existen en múltiples categorías por diseño:
- **Sobre ruedas**: A pasear (16 prod) + A jugar (0 prod)
- **Montables de exterior**: A pasear (0 prod) + A jugar (5 prod)
- **Triciclos y bicicletas**: A pasear (15 prod) + A jugar (0 prod)

### 2. Búsquedas por palabra clave:
Algunos grupos usan términos que NO coinciden exactamente con nombres de subcategorías en BD. El sistema de búsqueda mejorado los encuentra por palabras individuales:
- "Portabebé 0-13 kg" → busca "Portabebé"
- "Con Portabebé" → busca "Portabebé"
- "0-12 meses" → busca en features del producto

### 3. Lógica de búsqueda implementada:
El sistema divide los términos de búsqueda por espacios y comas, luego busca cada palabra en:
- Nombre de subcategoría (s.name)
- Nombre de marca (b.name)
- Características del producto (vi.features)

Ejemplo: "Cunas, colechos y muebles" → busca "Cunas" OR "colechos" OR "muebles"

---

## 📝 CAMBIOS RECIENTES

### Commit acf97be (2025-01-13):
1. **Sillas para comer**: Movido de "A comer" a "En Casa"
2. **Andaderas**: Movido de "En Casa" a "A jugar"
3. **Sobre Ruedas** (A pasear): Cambiado de single a grouped
4. **Sillas para bicicleta**: Removido de "A jugar", solo existe en "A pasear"

### Commit 9dd9256 (2025-01-13):
1. **Sillas para comer**: Primera corrección de categoría

---

## ✅ VALIDACIÓN

- ✅ Todas las categorías verificadas contra base de datos de producción
- ✅ Conteos de productos actualizados al 13 de enero 2025
- ✅ No hay discrepancias de categorización pendientes
- ✅ Sistema de búsqueda mejorado implementado y desplegado en API

---

**Generado por**: Claude Code
**Última actualización**: 2025-01-13 02:00 UTC
