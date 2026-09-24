# Etapa 5 — POS: Sistema de apartados

**Apps:** `apps/pos`, `packages/api`, posiblemente `apps/print-bridge`.
**Dev:** ~3.5 días.
**Depende de:** Etapa 3 (la ficha del cliente es donde se consultan sus apartados).

---

## Lo que pide Pablo

> *"Sería ideal que diera información si el cliente tiene algún producto apartado, indicando el monto con el que apartó y cuánto le falta para liquidar el artículo que se apartó."* — **Junta:** entra en esta ronda.

**Estado:** no existe nada — ni tablas ni concepto de reserva de stock. El inventario solo conoce `quantity`; un artículo apartado hoy seguiría vendible en mostrador **y en la tienda en línea**.

---

## Reglas de negocio

1. **Apartar = reservar el artículo con un anticipo.** El artículo **sale del inventario disponible** en el momento de apartarse (se descuenta `inventario.quantity`, igual que una venta). Si no, se vende dos veces — en mostrador o en línea.
2. **Abonos:** el cliente puede dar varios abonos, cada uno con su método de pago (efectivo / tarjeta / transferencia / crédito de tienda), hasta liquidar.
3. **Liquidar:** cuando `pagado >= total`, el apartado se convierte en **venta** (registro en `sales`, para que salga en historial y estadísticas) **sin volver a descontar stock**.
4. **Cancelar:** el artículo **regresa al inventario**. Qué pasa con el anticipo (se devuelve en efectivo, en crédito de tienda, o se pierde) es **decisión de la cajera en el momento**, con los tres botones.
5. **Vencimiento:** fecha límite opcional. El sistema **muestra** los vencidos en rojo; **no cancela solo**. ⏳ Confirmar con Pablo si quiere plazo/anticipo mínimo obligatorios.
6. **Sin descuento** por ahora en apartados (se puede añadir después reusando `resolveDiscount` de `sales.model.ts`).

---

## Modelo de datos — migración `048`

```sql
CREATE TABLE layaways (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  location VARCHAR(50),
  total_amount NUMERIC(10,2) NOT NULL,        -- suma de los artículos
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0, -- suma de abonos (desnormalizado; se recalcula en cada abono)
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
  due_date DATE,
  sale_id INTEGER REFERENCES sales(id),       -- se llena al liquidar
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancel_refund_method VARCHAR(20)            -- 'efectivo' | 'credito_tienda' | 'forfeited'
);

CREATE TABLE layaway_items (
  id SERIAL PRIMARY KEY,
  layaway_id INTEGER NOT NULL REFERENCES layaways(id) ON DELETE CASCADE,
  inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE layaway_payments (
  id SERIAL PRIMARY KEY,
  layaway_id INTEGER NOT NULL REFERENCES layaways(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  payment_method VARCHAR(20) NOT NULL,        -- mismo vocabulario que payment_details
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
Índices: `layaways(client_id)`, `layaways(status)`, `layaways(due_date)`, `layaway_items(layaway_id)`, `layaway_items(inventario_id)`, `layaway_payments(layaway_id)`.

---

## Puntos de integración

| Capa | Archivo | Qué hacer |
|------|---------|-----------|
| DB | **migración `048`** | Tablas de arriba. |
| Modelo API | **nuevo `packages/api/src/models/layaway.model.ts`** | `Layaway`, `LayawayItem`, `LayawayPayment`, `CreateLayawayDto`, `AddPaymentDto`, `LayawayQueryParams`. Imitar `sales.model.ts`. |
| Servicio API | **nuevo `packages/api/src/services/layaway.service.ts`** | `createLayaway` (transacción: validar stock como `createSale` `sales.service.ts:30`, insertar, **descontar stock**, registrar el anticipo como primer `layaway_payment`; si el anticipo es crédito de tienda, descontar saldo y registrar `client_credit_movements`). `addPayment` (transacción: insertar abono, recalcular `paid_amount`; si llega al total → `completeLayaway`). `completeLayaway` (insertar en `sales` + `sale_items` + `payment_details` con los abonos acumulados, **sin tocar stock**, marcar `completed`, guardar `sale_id`). `cancelLayaway` (restaurar stock; según `cancel_refund_method` acreditar crédito o solo registrar). `getLayaways`, `getLayawayById`, `getLayawaysByClient`, `getLayawayStats`. |
| Servicio API | `packages/api/src/services/sales.service.ts` (`createSale`) | **Extraer** la inserción de `sales`/`sale_items`/`payment_details` a un método interno reutilizable con opción `skipStockUpdate`, para que `completeLayaway` lo llame. **No** duplicar el INSERT de ventas. |
| Controller / rutas | **nuevos `layaway.controller.ts`, `layaway.routes.ts`** + registrar en `routes/index.ts` | `GET /api/layaways`, `POST /api/layaways`, `GET /api/layaways/:id`, `POST /api/layaways/:id/payments`, `POST /api/layaways/:id/cancel`, `GET /api/layaways/stats`. Permisos: `superadmin, admin, manager, gerente, sales, vendedor`. |
| Inventario | `packages/api/src/services/sales.service.ts` (`searchInventory`) | Exponer si un artículo con `quantity = 0` está **apartado** (join a `layaway_items` activos), para que en el POS se vea "Apartado" en vez de "Sin stock". |
| Servicio front | **nuevo `apps/pos/src/services/layaway.service.ts`** | Cliente HTTP. |
| Módulo nuevo | `apps/pos/src/components/modules/ApartadosModule.jsx` | Pestañas: **Nuevo apartado** / **Apartados activos** / **Historial**. |
| UI nueva | `apps/pos/src/components/layaways/NewLayaway.jsx` | Flujo: cliente (**obligatorio** — reusar `ClientSelection.jsx`) → productos (reusar `SearchProducts.jsx`) → anticipo (método + monto) → fecha límite → confirmar. |
| UI nueva | `apps/pos/src/components/layaways/LayawaysList.jsx` + `LayawayDetailModal.jsx` | Lista con **Total / Pagado / Falta / Vence**, vencidos en rojo. Detalle con tabla de abonos y botones **Abonar** / **Liquidar** / **Cancelar**. |
| UI nueva | `apps/pos/src/components/layaways/AddPaymentModal.jsx` | Abono: método + monto (con "Liquidar todo" que rellena el faltante). |
| Ficha del cliente | `apps/pos/src/components/clients/ClientDetailModal.jsx` (Etapa 3) | Llenar la sección **Apartados**: monto apartado, pagado, **cuánto falta**, vencimiento — es literalmente lo que pidió Pablo. |
| Navegación | `apps/pos/src/components/POSApp.jsx:11-31`, `:35-62`, `:75-95`, `:120-135` | Registrar el módulo `apartados` en los **cuatro** puntos. |

---

## Comprobante impreso (⏳ confirmar con Pablo)

Se asume **sí**: un ticket simple de abono (cliente, artículos, abono de hoy, pagado acumulado, **falta**, vence). Es la constancia que el cliente se lleva. Implica:
- Nuevo payload en `ticket.model.ts` (`LayawayReceiptPayloadV1`) + builder en `ticket.service.ts` + endpoint `GET /api/layaways/:id/receipt-payload`.
- **Espejo manual** en `apps/print-bridge/src/types/ticket.types.ts` + nuevo renderer.
- **Actualización manual del print-bridge en la PC de la caja.**
- Al **liquidar**, se imprime el **ticket de venta normal** (ya existe) porque se creó una venta real.

Si Pablo dice que no, se recortan ~0.5 día.

---

## Qué NO construir
- **No** inventar un estado de "reservado" en `inventario`: descontar `quantity` es lo que ya entienden el POS y la tienda en línea, y es lo que hace una venta. El join a `layaway_items` es solo para etiquetar.
- **No** duplicar la inserción de ventas: refactorizar `createSale` para reusarla al liquidar.
- **No** construir nada de caja: los abonos quedan en `layaway_payments` con fecha y método; cuando llegue el corte de caja los leerá de ahí.
- **No** cancelar apartados automáticamente por vencimiento.
- **No** permitir apartados sin cliente registrado (a diferencia de la venta, que admite cliente ocasional): sin cliente no hay a quién cobrarle el resto.

---

## Migración
Sí — **`048-create-layaways-tables.sql`**. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- Apartar un artículo con $200 de anticipo: desaparece del inventario disponible en el POS **y de la tienda en línea**; la ficha del cliente muestra "apartó $200, faltan $X".
- Abonar $150: pagado y faltante se actualizan; se imprime comprobante de abono.
- Liquidar: aparece una venta nueva en el historial de ventas con los abonos como pagos; el stock **no** cambia; se imprime ticket de venta.
- Cancelar con "devolver en crédito": el artículo vuelve al inventario y el cliente tiene el anticipo como crédito con su movimiento registrado.
- Un apartado con fecha límite pasada se ve en rojo en la lista.
- Intentar apartar un artículo sin stock: se rechaza.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + **migración 048 manual vía psql**.
- Frontend: push → Vercel (POS).
- Print-bridge: actualización manual en la PC de la caja (si hay comprobante de abono).
