# Etapa 4 — Notas + Preparar productos

**Apps:** `apps/tienda` (aquí viven "preparar productos" y "gestión de productos"), `packages/api`.

> **Dos campos de nota ya existen** en `valuation_items`: `notes` (valuador) y `online_notes` (online, migración 030). Al publicar, `prepareProductForStore` (`store.service.ts:673-696`) **no toca ninguno** → no se sobreescriben. Coincide con lo que Pablo pidió: la nota de valuador se muestra **solo como referencia**, y la nota online se edita aparte.

---

## Item 6 — Mostrar nota del valuador como referencia (read-only) en Preparar Productos

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `packages/api/src/services/store.service.ts:44-68` (`getPendingProducts` SELECT) | Añadir `vi.notes` (hoy solo trae `online_notes` en `:54`). |
| `apps/tienda/src/components/ProductPreparation.jsx:10-67` (`ProductCard`, online_notes en `:43-48`) | Renderizar `notes` como referencia read-only, aparte del input de `online_notes`. |

### Qué NO construir
- No unificar campos ni auto-copiar: solo **mostrar** la nota de valuador.

---

## Item 9 — Nota editable en Gestión de Productos (post-publicación)

> ✅ El endpoint **ya existe**: `PUT /store/products/:id/notes` → `updateProductNotes` (escribe `online_notes`). El servicio del front ya lo expone.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/components/ProductEditModal.jsx` (envía 4 campos, `:80-87`) | Añadir **textarea de nota** + llamar `storeService.updateProductNotes` (`apps/tienda/src/services/store.service.ts:322`). |
| `packages/api/src/services/store.service.ts:1350-1373` (`getPublishedProductsForManagement` SELECT) | Añadir `vi.online_notes` (y opcional `vi.notes`) para precargar el modal. |

### Qué NO construir
- No crear endpoint: reusar `updateProductNotes` / `PUT /store/products/:id/notes`.

---

## Item 10 — Descartar / No publicar + filtro + selección múltiple

**Objetivo:** poder descartar productos (los que no llevan foto, ej. mucha ropa) para que no saturen la lista de preparación; filtro (en tienda / no publicar); selección múltiple para descartar en lote.

> Aquí sí hay trabajo real. No existe estado "descartado" hoy.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| DB | **nueva migración** | Añadir `online_discarded BOOLEAN DEFAULT FALSE` a `valuation_items`. |
| Query pending | `store.service.ts:67` | Añadir `AND vi.online_discarded = false`. |
| Stats | `store.service.ts:776` | Reflejar el nuevo estado. |
| Filtro UI | `ProductPreparation.jsx:541-589` (bloque filtros) y estado `:408-414` | Select "en tienda / no publicar / pendientes". |
| Bulk multi-select | Reusar patrón de `ProductManagement.jsx:105,199-213,25-30` + `BulkActionsBar.jsx` | `ProductPreparation` hoy no tiene multi-select. |
| Bulk backend | `store.service.ts:1001-1025` (`bulkUpdateProducts`), controller `store.controller.ts:385` (`validActions`), route `store.routes.ts:101-103` | Añadir acción `discard`. **Ojo:** el bulk filtra `online_store_ready=true` (`:1014`); la acción sobre pendientes necesita una rama que no exija `ready=true`. |

### Qué NO construir
- No rehacer todo `ProductPreparation`: reusar el patrón de multi-select de `ProductManagement`.

---

## Item nuevo (feedback Pablo, post-junta) — Precio de producto publicado: física vs. en línea

**Contexto (verificado en código): existen DOS precios distintos por producto.**
- `valuation_items.final_sale_price` → **precio de tienda física** (inventario/POS). Se edita en POS → `apps/pos/src/components/inventory/PriceUpdateModal.jsx` vía `PUT /inventory/:id/price` (`updateInventoryPrice`).
- `valuation_items.online_price` → **precio de tienda en línea**. Se edita en Gestión de Productos → `apps/tienda/src/components/ProductEditModal.jsx` (label **"Precio de venta online"**) vía `updatePublishedProduct` (`store.service.ts:835`).

**Bug real reportado:** al publicar, `updateInventoryPrice` (`packages/api/src/services/sales.service.ts:763-772`) **rechaza** editar el precio físico si `online_store_ready = true`, con el mensaje *"Actualiza el precio desde la preparación de la tienda en línea"* — pero esa preparación edita `online_price` (otro campo). Consecuencia: **el precio FÍSICO de un producto publicado queda sin forma de editarse**, y el mensaje es engañoso.

**Decisión de producto (⏳ pregunta para Pablo):**
- **(A) Independientes:** permitir editar el precio físico de un producto publicado desde inventario, sin tocar el online (arreglar el bloqueo + el mensaje).
- **(B) Ligados:** que editar el precio en Gestión (online) también actualice el físico (o viceversa) — es lo que Pablo pidió: *"si lo modifico en gestión me ponga ese precio en inventario"*.

> Nota: la UI de gestión ya rotula "Precio de venta online", así que la info para distinguirlos existe. Confirmar con Pablo si quiere **sincronizarlos** o solo **poder editar el físico** de un publicado.

### Puntos de integración (según decisión)
| Opción | Archivo:línea |
|---|---|
| Desbloquear/editar físico (A) | `sales.service.ts:744-772` (`updateInventoryPrice`) + `apps/pos/src/components/inventory/PriceUpdateModal.jsx` |
| Sincronizar (B) | `store.service.ts:906-917` (`updatePublishedProduct`) para también `SET final_sale_price`, y/o `updateInventoryPrice` para `SET online_price` |

**Migración:** ninguna (solo lógica).

---

## Migración
- Sí: `online_discarded` en `valuation_items`. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- En preparar productos se ve la nota del valuador como referencia. En gestión se puede editar/añadir nota a un producto ya publicado. Se pueden descartar productos en lote y filtrarlos fuera de la lista de pendientes.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku + migración manual. Frontend: push → Vercel (tienda).
