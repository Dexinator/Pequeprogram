# Etapa 1 — POS: Cobro (pago mixto, cambio en efectivo, calculadora)

**Apps:** `apps/pos`, `packages/api`, `apps/print-bridge`.
**Dev:** ~2.5 días.
**Por qué primero:** son los tres items de fricción diaria en caja. Items 1 y 3 son puro frontend; el Item 2 (**decisión de Pablo: el cambio sí sale en el ticket**) recorre toda la cadena venta → ticket → print-bridge.

---

## Item 1 — Pago mixto: decir cuánto falta

> **Pablo:** *"En el pago mixto de una venta, aparece una nota de que no coincide con el total. Se pide que identifique la cantidad que falta para cubrir el total. Ejemplo: un cliente paga con crédito de tienda y no le alcanza para cubrir el costo, lo que se pide es que diga cuánto le falta."*

**Estado actual:** `PaymentMethod.jsx:63-64` valida la suma pero solo dice que no coincide:

```js
if (Math.abs(sum - total) > 0.01) {
  setPaymentError(`La suma de pagos ($${sum}) no coincide con el total ($${total})`);
}
```

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| UI | `apps/pos/src/components/sales/PaymentMethod.jsx:61-67` (`updatePaymentMethod`) | Calcular `diff = total - sum` y mostrar mensaje dirigido: si `diff > 0` → **"Falta $X por cubrir"**; si `diff < 0` → **"Sobran $X"**. Mantener la tolerancia de `0.01`. |
| UI | `apps/pos/src/components/sales/PaymentMethod.jsx:234-250` (resumen de pagos mixtos) | Añadir una línea permanente **"Falta por cubrir: $X"** / **"Sobrante: $X"** bajo "Total pagos", en rojo/ámbar, visible siempre (no solo cuando hay error). Es el dato que Pablo quiere leer de un vistazo. |
| UI | `apps/pos/src/components/sales/PaymentMethod.jsx:22-32` (salto automático a mixto por crédito insuficiente) | Ese path ya prellena `efectivo = total - clientStoreCredit`. Verificar que con el nuevo cálculo el faltante quede en **$0.00** al entrar, y que el mensaje inicial no aparezca como error. |

**Sugerencia de UX (opcional, decidir en implementación):** botón **"Completar con este método"** junto a cada renglón de pago mixto que rellene el faltante en ese renglón. Es la operación que la cajera hace a mano hoy.

### Qué NO construir
- **No** tocar la API: la validación de pago mixto del backend (`sales.service.ts:75-78`) ya es correcta y se queda igual. Esto es puramente presentación en el POS.
- **No** cambiar el payload de `createSale`.

---

## Item 2 — Efectivo: capturar monto recibido, calcular el cambio y **imprimirlo en el ticket**

> **Pablo:** *"En el método de pago efectivo permita capturar monto para que aparezca el importe de cambio. Ejemplo: venta por $350 pagada con $500 corresponde un cambio de $150. Esto solo si se captura un importe de pago en efectivo; si no se captura ese importe se prosigue con la venta normal."*
>
> **Decisión de la junta:** el cambio **sí se toma en cuenta** → se guarda en la venta y **sale en el ticket**.

**Claves de la petición:**
- El campo es **opcional**. Si la cajera no captura nada, la venta procede exactamente como hoy y el ticket no imprime líneas de efectivo/cambio.
- Se persiste para que el ticket (y una reimpresión posterior) lo muestre igual.

### Modelo de datos — migración `045`

```sql
-- 045-add-sale-cash-received.sql  (imitar el estilo de 035-add-sale-discount.sql)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cash_received NUMERIC(10,2);   -- NULL = no se capturó
ALTER TABLE sales ADD COLUMN IF NOT EXISTS change_given  NUMERIC(10,2);   -- NULL = no aplica
```
`change_given = cash_received - (monto pagado en efectivo)`. Se calcula en el **backend** (nunca confiar en el valor del front) y se acota a `>= 0`.

### Puntos de integración (cadena completa, en orden)

| # | Capa | Archivo / línea | Qué hacer |
|---|------|-----------------|-----------|
| 1 | DB | **migración `045`** | Columnas de arriba. |
| 2 | Modelo API | `packages/api/src/models/sales.model.ts:54-63` (`CreateSaleDto`) y la interfaz `Sale` | Añadir `cash_received?: number` al DTO; `cash_received` y `change_given` al modelo de venta. |
| 3 | Servicio API | `packages/api/src/services/sales.service.ts` (`createSale`, INSERT de `sales` ~línea 100-130) | Si viene `cash_received`: validar `>= suma de payment_details con method='efectivo'`; calcular `change_given`; guardar ambos. Si no viene: guardar NULL. |
| 4 | Servicio API | `sales.service.ts:225` (`getSaleById`) y `:329` (`getSales`) | Exponer las dos columnas. |
| 5 | Ticket (contrato) | `packages/api/src/models/ticket.model.ts:60-67` (`TicketTotals`) | Añadir `cash_received: number \| null` y `change_given: number \| null`. |
| 6 | Ticket (builder) | `packages/api/src/services/ticket.service.ts:63-70` y SELECT `:85-92` | Poblar desde `sales`. |
| 7 | Ticket (espejo) | `apps/print-bridge/src/types/ticket.types.ts` | **Sincronizar manualmente** con `ticket.model.ts` (no hay import compartido). |
| 8 | Ticket (render) | `apps/print-bridge/src/renderers/ticket.renderer.ts:84-90` (después de `TOTAL` y del bloque de pagos) | Si `cash_received !== null`: imprimir `Efectivo recibido  $500.00` y `Cambio  $150.00` con `twoCol`. Si es null, no imprimir nada. |
| 9 | Front payload | `apps/pos/src/services/sales.service.ts:51-59` (`CreateSaleData`) | Añadir `cash_received?: number`. |
| 10 | Front UI | `apps/pos/src/components/sales/PaymentMethod.jsx` — bloque simple `efectivo` y renglones `efectivo` del mixto (`:188-225`) | Input opcional **"Efectivo recibido"**. Mostrar **"Cambio: $X"** en grande cuando `recibido >= efectivo a pagar`. Si `recibido < efectivo a pagar`: aviso, **sin bloquear**. |
| 11 | Front estado | `apps/pos/src/components/sales/NuevaVenta.jsx:24-33` | Guardar `cashReceived` en el estado de la venta y mandarlo en el payload solo si tiene valor. |
| 12 | Front confirmación | `apps/pos/src/components/sales/SaleConfirmation.jsx` | Mostrar el cambio en la pantalla de venta completada (es lo que la cajera lee para dar el cambio). |
| 13 | Historial | `apps/pos/src/components/sales/HistorialVentas.jsx` (modal de detalle) | Mostrar efectivo recibido / cambio si existen. |

**En pago mixto:** el cambio se calcula contra **el renglón de efectivo**, no contra el total de la venta (si pagó $200 tarjeta + $300 efectivo con un billete de $500, el cambio es $200).

### Qué NO construir
- **No** bloquear la venta si el monto recibido es menor al total o está vacío: Pablo pide explícitamente que sin captura la venta siga normal.
- **No** crear un endpoint nuevo: extender `createSale` y el contrato `TicketPayloadV1` existente, igual que se hizo con el descuento (migración 035).
- **No** calcular el cambio en el front para guardarlo: el front solo lo *muestra*; el backend lo calcula y persiste.

---

## Item 3 — Botón de calculadora

> **Pablo:** *"Sería bueno tener un botón para mostrar una calculadora."*

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| Componente nuevo | `apps/pos/src/components/common/CalculatorModal.jsx` | Calculadora básica en modal: dígitos, `+ − × ÷ =`, `C`, `←`, punto decimal. **Soporte de teclado numérico** (la caja tiene teclado, no es táctil). |
| UI | `apps/pos/src/components/POSApp.jsx:66-95` (barra de navegación) | Botón flotante o de barra 🧮 disponible **en todos los módulos**, no solo en ventas. |

**Requisito de UX:** debe abrir y cerrar sin perder el estado de la venta en curso (montar el modal por encima, nunca desmontar `NuevaVenta`). **No** usar `alert()`/`prompt()`.

### Qué NO construir
- **No** integrar el resultado de la calculadora con los campos de pago (copiar/pegar manual es suficiente y evita errores de cobro).
- **No** usar una librería externa: son ~120 líneas de JSX.

---

## Migración
Sí — **`045-add-sale-cash-received.sql`** (Item 2). Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- Pago mixto con crédito de tienda insuficiente: la pantalla dice **"Falta $X por cubrir"** con el importe correcto, y el faltante llega a $0.00 al completar.
- Venta de $350 cobrada con $500 en efectivo: muestra **Cambio: $150.00** en pantalla, en la confirmación, en el detalle del historial **y en el ticket impreso** (también al reimprimir).
- Pago mixto $200 tarjeta + $300 efectivo con $500 recibidos: cambio **$200.00**.
- Venta de $350 en efectivo **sin capturar** monto recibido: se cobra igual que hoy, sin avisos.
- La calculadora abre desde cualquier módulo y al cerrarla la venta en curso sigue intacta.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + **migración 045 manual vía psql**.
- Frontend: push → Vercel (POS).
- **Print-bridge: actualización manual en la PC de la caja** (`git pull` → `npm run build` → reiniciar servicio de Windows). Hasta que se haga, el API manda los campos pero el ticket no los imprime.
