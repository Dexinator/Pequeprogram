# Etapa 2 — POS: Inventario (filtros) y catálogo de claves

**Apps:** `apps/pos`, `packages/api` (cambio menor).
**Dev:** ~1.5 días.

---

## Item 1 — Filtro por categoría y subcategoría en inventario

> **Pablo:** *"En la sección de inventario falta un filtro por categoría y producto."*

> ⚠️ **La API YA lo soporta.** `SalesService.searchInventory` (`packages/api/src/services/sales.service.ts:495-503`) ya acepta `category_id` y `subcategory_id`, y `InventorySearchParams` (`packages/api/src/models/sales.model.ts:118-126`) ya los declara. **Falta únicamente la UI del POS.** No reconstruir el endpoint.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| UI | `apps/pos/src/components/inventory/InventoryList.jsx:316-353` (grid de filtros) | Añadir dos `<select>`: **Categoría** y **Subcategoría** (la de subcategoría se puebla al elegir categoría y se deshabilita mientras no haya una). |
| UI | `apps/pos/src/components/inventory/InventoryList.jsx:64-70` (estado `filters`) | Añadir `category_id: ''` y `subcategory_id: ''`. |
| UI | `apps/pos/src/components/inventory/InventoryList.jsx:145` (`handleFilterChange`) | Al cambiar categoría, **limpiar `subcategory_id`** (si no, quedan combinaciones imposibles que devuelven 0 resultados). |
| UI | `apps/pos/src/components/inventory/InventoryList.jsx:256` (`clearFilters`) | Incluir los dos campos nuevos. |
| Servicio front | `apps/pos/src/services/inventory.service.ts` | Pasar `category_id`/`subcategory_id` en la query string de `searchInventory` (omitirlos si vienen vacíos). |
| Datos | endpoints existentes `GET /api/categories` y `GET /api/categories/:id/subcategories` | Reusar tal cual para poblar los selects. |

### Qué NO construir
- **No** crear endpoints de categorías: ya existen y otros módulos del POS los consumen.
- **No** tocar `searchInventory` para este item.

---

## Item 2 — Filtro "No disponibles"

> **Pablo:** *"…y en productos disponibles y todos falta uno de No disponibles."*

**Estado actual:** el filtro es un booleano `available_only` → solo hay "Solo disponibles" y "Todos" (`InventoryList.jsx:349-356`, API `sales.service.ts:486-489`). Falta el tercer estado.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| Modelo API | `packages/api/src/models/sales.model.ts:118-126` | Añadir `availability?: 'available' \| 'unavailable' \| 'all'`. **Conservar `available_only`** como deprecado para no romper otros consumidores. |
| Servicio API | `packages/api/src/services/sales.service.ts:486-489` | Traducir: `available` → `quantity > 0`; `unavailable` → `quantity <= 0`; `all` → sin condición. Si llega `available_only` y no `availability`, respetar el comportamiento viejo. |
| Controller/rutas | `packages/api/src/controllers/sales.controller.ts` (handler de `/api/inventory/search`) | Leer y validar el nuevo query param. |
| Servicio front | `apps/pos/src/services/inventory.service.ts` | Enviar `availability` en vez de `available_only`. |
| UI | `apps/pos/src/components/inventory/InventoryList.jsx:344-357` | Select de 3 opciones: **Solo disponibles** (default) / **No disponibles** / **Todos**. |

**Ojo con `otherprods`:** `searchInventory` hace UNION entre artículos de valuación y productos OTRP. Verificar que la condición de disponibilidad se aplique **a las dos ramas** del UNION, no solo a la primera.

### Qué NO construir
- **No** eliminar `available_only` del modelo: hay llamadas existentes (`InventoryList.jsx:66`, `SearchProducts.jsx`) y romperlas de golpe es un riesgo innecesario en caja.

---

## Item 3 — Catálogo de claves de producto

> **Pablo:** *"Sería conveniente tener un catálogo como referencia con las claves de producto, como ejemplo: AUTP Autoasientos, ANDP Andaderas, y así, para poder consultar más fácilmente."*

> ⚠️ **El dato ya existe:** `subcategories.sku` es exactamente esa clave (la usa `searchInventory` para armar los IDs de inventario, `sales.service.ts:253`). Es una **pantalla de consulta**, no un módulo de datos nuevo.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| Datos | `GET /api/categories` + `GET /api/categories/:id/subcategories` | Reusar. Si el endpoint de subcategorías no devuelve `sku`, **añadirlo al SELECT** (cambio de una línea en `category.service.ts`). Verificar primero. |
| UI nueva | `apps/pos/src/components/inventory/SkuCatalog.jsx` | Tabla **Clave → Subcategoría → Categoría**, con buscador de texto (que filtre por clave *y* por nombre) y agrupada por categoría. Solo lectura. |
| UI | `apps/pos/src/components/modules/InventarioModule.jsx` | Añadir pestaña/botón **"Claves de producto"** dentro del módulo de Inventario (es material de consulta de inventario, no merece módulo propio en la barra principal). |

### Qué NO construir
- **No** crear tabla nueva de claves ni un CRUD: la fuente de verdad es `subcategories.sku` y se administra donde ya se administran las subcategorías.
- **No** permitir editar el SKU desde esta pantalla — cambiarlo rompería los IDs de inventario ya generados.

---

## Migración
No. El único cambio de backend es de lógica de consulta (`availability`), sin cambio de esquema.

## Criterio de aceptación (staging)
- Filtrar inventario por categoría "A pasear" y subcategoría "Andaderas" devuelve solo esos artículos; cambiar la categoría limpia la subcategoría.
- El filtro **"No disponibles"** lista artículos con stock 0 (incluidos los OTRP), y **"Todos"** sigue mostrando ambos.
- El catálogo de claves muestra `ANDP → Andaderas`, `AUTP → Autoasientos`, y el buscador encuentra tanto por "ANDP" como por "andadera".

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging. **Sin migración.**
- Frontend: push → Vercel (POS).
