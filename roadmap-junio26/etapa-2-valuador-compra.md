# Etapa 2 — Valuador: flujo de compra

**Apps:** `apps/valuador`, `packages/api`.

---

## Item 1 — Botón de imprimir compra (hoy es un placeholder)

**Objetivo:** que el botón "Imprimir" de la consulta de compra imprima de verdad (hoy muestra un `alert` de "en una implementación real...").

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/valuador/src/components/DetalleValuacion.jsx:344-345` (`handlePrint` alert) y botón `:462-471` | Reemplazar el `alert` por renderizar `OfertaDocument` en un modal. |
| `apps/valuador/src/components/OfertaDocument.jsx:3` (props) y `:343-572` (impresión real) | **Reusar**: usa `window.open` + `document.write` + `print()` + auto-close. |
| `apps/valuador/src/components/HistorialValuaciones.jsx:419,968` | Espejo del montaje: mapear la valuación finalizada a los props de `OfertaDocument`. |

### Qué NO construir
- No es el `print-bridge` (ese es para tickets/etiquetas térmicas). Es impresión de navegador vía `OfertaDocument`.

---

## Item 2 — Editar cantidad de artículos en el resumen

**Objetivo:** que la columna "cantidad" del resumen de compra sea editable y recalcule totales.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `NuevaValuacion.jsx:1120` (`{product.quantity || 1}` read-only) | Convertir a input cuando `isEditing`, siguiendo el patrón del precio (`:1055`, inputs `:1125-1157`). |
| `NuevaValuacion.jsx:89,235,242` (`editingProduct`, `saveEditedPrice`) | Reusar mecanismo de edición (mapa `editedQuantities` o extender `saveEditedPrice`). |
| Totales: `NuevaValuacion.jsx:196-219`, `678-694`, `1161`, `1170` | Que lean la cantidad editada en vez de `product.quantity`. |
| Lectura posterior: `DetalleValuacion.jsx:331-337` | Ya multiplica por cantidad. |

### Qué NO construir
- No rehacer el resumen: reusar el toggle de edición existente.

---

## Item 3 — Guardar compra sin finalizar (borrador)

**Objetivo (confirmado por Pablo):** guardar **todo** el estado de la valuación y poder **recuperarla en el estado en que se quedó** tras dar "guardar como borrador", para seguir editándola.

> Se reusa el estado **`status='pending'`** que ya existe, pero el reto real no es guardar: es **rehidratar** `NuevaValuacion` con todo el trabajo capturado (cliente, artículos, features, precios editados, modalidades, cantidades) para continuar — no solo verla.

### Alcance = guardar + recuperar el estado completo

- **Guardar:** persistir el mismo payload que `finalizeValuation` (`NuevaValuacion.jsx:816`) pero con `status='pending'`: cliente + todos los `selectedProducts` con sus `features`, `editedPrices`, `editedModalities` y cantidades editadas.
- **Recuperar:** al abrir un borrador pendiente, **cargar de vuelta** ese estado en `NuevaValuacion` (no en modo solo-lectura), reconstruyendo `client`, `selectedProducts`, `editedPrices`, `editedModalities`, features y `showSummary` según corresponda.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `packages/api/src/migrations/002-valuation-schema.sql:91` | `status` ya soporta `pending/completed/cancelled`. Sin cambio de esquema. |
| `packages/api/src/services/valuation.service.ts:383` | `finalize-complete` hardcodea `'completed'`. Añadir path que inserte/actualice con `status='pending'` (reusar `createValuation` `:117`). Debe guardar TODOS los items con features/precios/modalidades. |
| `apps/valuador/src/components/NuevaValuacion.jsx:1362-1414` | Botón "Guardar borrador" junto a "Volver a Editar"/"Imprimir Oferta"; postea el payload como pending. |
| `apps/valuador/src/components/NuevaValuacion.jsx` (estado `:74,75,83,87,91`) | **Path de rehidratación:** función que reciba una valuación pending y reponga `showSummary/summary/selectedProducts/editedPrices/editedModalities`. |
| `DetalleValuacion.jsx:473` | Ya gatilla "editar" en pendientes → debe llevar al path de rehidratación de arriba (no solo a ver). |

### Qué NO construir
- No crear un flujo/tabla de drafts nuevo: reusar `status='pending'`.
- No basta con insertar pending: hay que asegurar la **recuperación fiel** del estado editable.

> **Ojo (idempotencia):** guardar borrador, editar y volver a guardar debe **actualizar** el mismo registro (no crear duplicados). Definir si el segundo "guardar" hace UPDATE del pending existente.

---

## Item 8 — No perder características especiales al "Volver a editar"

**Objetivo:** al regresar a editar, conservar las selecciones de features ya hechas.

### Puntos de integración

| Archivo / línea | Causa / arreglo |
|-----------------|-----------------|
| `apps/valuador/src/components/ProductoForm.jsx:166-209` (effect `fetchFeatureDefinitions` por `subcategory_id`) | **Root cause:** en `:180-184` hace `initialFeatures[feature.name]=''` y `setFormData(... features: initialFeatures)`, pisando las features restauradas por el effect `:64-101`. |
| `ProductoForm.jsx:180-184` | **Fix:** sembrar desde `formData.features?.[feature.name] ?? ''` (merge) o saltar el reset si `initialData.features` ya está poblado. |

### Qué NO construir
- No rehacer el form: es un guard de una línea en el effect.

---

## Item 4 — Quitar de Juguetes: sobre ruedas, triciclos y bicicletas

**Objetivo:** que estas subcategorías no aparezcan al valuar, sin romper valuaciones históricas.

> **Confirmado por Pablo:** IDs = **8** (sobre ruedas) y **6** (triciclos y bicicletas).

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| Tabla `subcategories` (columna `is_active`) | `UPDATE subcategories SET is_active=FALSE WHERE id IN (8,6);` — **no DELETE** (FK desde `valuation_items`). |
| `packages/api/src/controllers/category.controller.ts:204,233` | Los reads ya filtran `is_active=true`; el dropdown (`ProductoForm.jsx:130`) dejará de mostrarlas. |

### Qué NO construir
- No borrar filas: solo `is_active=false` (migración/script SQL).

---

## Migración
- No hay cambio de esquema. Solo un **script SQL de datos** (`UPDATE ... is_active`) aplicado en staging vía `psql`.

## Criterio de aceptación (staging)
- Imprimir una compra real (no alert). Editar cantidad y ver totales correctos. Guardar borrador y retomarlo. Volver a editar sin perder features. Las 3 subcategorías desaparecen del valuador pero el historial sigue intacto.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku + script SQL. Frontend: push → Vercel (valuador).
