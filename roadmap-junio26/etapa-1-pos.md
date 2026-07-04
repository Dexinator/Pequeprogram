# Etapa 1 — POS (Punto de venta)

**Orden:** primera (empieza hoy → staging viernes/sábado).
**Apps:** `apps/pos`, `packages/api`, `apps/print-bridge`.

---

## Item 11 — Descuento en % o importe al vender

**Objetivo:** poder aplicar un descuento (porcentaje o importe fijo) a la venta al momento de cobrar; que se refleje en el total y en el ticket.

> **Decisión de Pablo:** el descuento es **sobre el TOTAL de la venta** (no por artículo), y **sí debe aparecer en reportes/estadísticas** además del ticket.
> ➜ Por eso se guarda `discount_amount`/`discount_type` en `sales` (no en `sale_items`), y `HistorialVentas.jsx` + `getSalesStats` deben reflejarlo.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| DB | **nueva migración** en `sales` | Añadir `discount_type` (`percentage`/`fixed_amount`) y `discount_value` / `discount_amount`. Imitar vocabulario de `active_discounts` (migración 025/028). |
| Modelo API | `packages/api/src/models/sales.model.ts:49` (`CreateSaleDto`) | Añadir campos de descuento. |
| Servicio API | `packages/api/src/services/sales.service.ts:67-78` | Ajustar `totalAmount` (línea 67) **antes** de la validación de pago mixto (75-78), o el descuento romperá la validación. |
| Controller API | `packages/api/src/controllers/sales.controller.ts:33` | Total legacy. |
| Front payload | `apps/pos/src/services/sales.service.ts:51-59` (`CreateSaleData`) | Añadir descuento al payload. |
| Front UI | `apps/pos/src/components/sales/NuevaVenta.jsx:24-33` y `PaymentMethod.jsx` | Input de descuento + recálculo de total/validez de pago. |
| Ticket (contrato) | `packages/api/src/models/ticket.model.ts:60-64` (`TicketTotals`) | Añadir línea de descuento/subtotal. |
| Ticket (builder) | `packages/api/src/services/ticket.service.ts:63-67` | Poblar descuento. |
| Ticket (espejo) | `apps/print-bridge/src/types/ticket.types.ts` | **Sincronizar manualmente** con `ticket.model.ts`. |
| Ticket (render) | `apps/print-bridge/src/renderers/ticket.renderer.ts:73-88` | Bloque de totales ESC/POS. |
| Reportes/historial | `apps/pos/src/components/sales/HistorialVentas.jsx` + `getSalesStats` (API) | Mostrar el descuento en el detalle de venta y reflejarlo en las estadísticas. |

### Qué NO construir
- No crear endpoint nuevo: extender `SalesService.createSale`.
- No inventar pipeline de impresión: fluir el descuento por el contrato `TicketPayloadV1` existente.

---

## Item nuevo (junta) — Reimprimir ticket

**Objetivo:** reimprimir el ticket de una venta pasada (ej. se acabó el papel).

> ⚠️ **YA EXISTE parcialmente.** El botón `ReprintTicketButton` (`HistorialVentas.jsx:7-51`) se renderiza por fila (`:269`) y llama `printBridgeService.printTicket(saleId, {copies:1})`. Probablemente Pablo no lo encontró.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/pos/src/components/sales/HistorialVentas.jsx:280-367` (modal detalle) | Añadir el botón de reimprimir **dentro del modal de detalle** (header ~`:283-296`), reusando el componente `ReprintTicketButton` ya existente. |

### Qué NO construir
- No crear nada nuevo de impresión: reusar `ReprintTicketButton` + `printBridgeService.printTicket` + `GET /api/sales/:id/ticket-payload`.

---

## Parkeado (NO en esta etapa)
- **Corte de caja** (saldo inicial, ventas/compras, cuadre, cajeros). Pablo lo documentará aparte.

---

## Migración
- Sí: nueva migración para columnas de descuento en `sales`. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- Vender con descuento % y con importe fijo; el total y el pago mixto cuadran; el ticket imprime el descuento.
- Reimprimir un ticket desde el detalle de una venta pasada.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + migración manual.
- Print-bridge: rebuild/redeploy si cambian los tipos del ticket.
- Frontend: push → Vercel (POS).
