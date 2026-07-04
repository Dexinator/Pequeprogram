# Etapa 3 — Valuador: consignaciones

**Apps:** `apps/valuador`, `packages/api`.

---

## Item 5 — Precio de consignación al 50% del precio de venta

**Objetivo:** en la pantalla de cálculo, que la consignación muestre **la mitad** del precio de venta (hoy repite el precio de venta completo), como referencia.

> ✅ **Bajo riesgo — el pago real al proveedor NO se afecta:** se calcula aparte en `consignment.service.ts markAsPaid` como `sale_price real × consignment_percentage (default 50%)`.
> **Decisión (confirmada):** cambiar **display + valor guardado** a 50% del precio de venta (para que contrato e historial sean consistentes) y **unificar la ropa** al mismo criterio (hoy usa `compra×1.2`).

### Puntos de integración

| Archivo / línea | Qué hacer / nota |
|-----------------|------------------|
| `apps/valuador/src/components/NuevaValuacion.jsx:1048` (header) y `:1164-1176` (celda) | La celda muestra `suggested_sale_price × quantity`. Mostrar **la mitad**. |
| `packages/api/src/services/valuation.service.ts:256-266` | `consignmentPrice = salePrice` → cambiar a `salePrice × 0.5` (guardar el valor al 50%). |
| `apps/valuador/src/components/ClothingBulkForm.jsx:175` | Ropa usa `compra×1.2` (modelo viejo, calculado en cliente) → **unificar** a `precio_venta × 0.5`. |
| Totales agregados: `valuation.service.ts:496-499`, `681-685` | `total_consignment = SUM(consignment_price × qty)`. Si se cambia el valor guardado, estos totales cambian. |
| Historial: `DetalleValuacion.jsx:175-183`, `328-337` | Muestran `consignment_price`. |
| **NO tocar** pago proveedor: `consignment.service.ts markAsPaid:316-335`, stats `:437` | Usan `sale_price real × %`, no `consignment_price`. |

### Qué NO construir
- No tocar la lógica de pago a proveedor. Si es solo referencia visual, cambiar únicamente la celda del front.

---

## Item 7 — Reimprimir contrato de consignación

**Objetivo:** reimprimir el contrato de una consignación ya ingresada, **desde el Valuador**.

> ✅ El componente de contrato **ya existe**: `ContratoConsignacion.jsx` (imprime con `window.open`, mismo mecanismo que la oferta).

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/valuador/src/components/ContratoConsignacion.jsx:3` (props) y `:245-553` (print) | **Reusar** el componente/impresión. |
| `apps/valuador/src/components/ConsignmentsList.jsx:385-410` (columna acciones) | Añadir botón "Reimprimir contrato" (junto a "Ver"/"Marcar Pagado"). Alt: modal detalle `~:572-582`. |
| Moldear datos | Cada fila es un `valuation_item`; `ContratoConsignacion` espera **array** (`consignmentProducts`) + `client` + `getProductDescription`. Shape la fila (o traer la valuación completa) antes de renderizar. |
| `apps/valuador/src/pages/consignaciones.astro` + `services/consignment.service.ts` | Ruta y datos. |

### Qué NO construir
- No crear nuevo template ni mecanismo de impresión: reusar `ContratoConsignacion`.

---

## Migración
- Opcional: solo si se decide **persistir** `consignment_price` al 50% (no requiere columna nueva). Si es display-only, **sin migración**.

## Criterio de aceptación (staging)
- Al calcular, la consignación muestra la mitad del precio de venta (incluyendo ropa). Reimprimir el contrato de una consignación pasada desde el valuador.

## Deploy
- Frontend: push → Vercel (valuador). Backend solo si cambia la fórmula/valor guardado.
