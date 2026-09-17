# Etapa 4 — POS: Devoluciones de mercancía

**Apps:** `apps/pos`, `packages/api`, posiblemente `apps/print-bridge`.
**Dev:** ~3 días.
**Por qué al final:** es el único item del documento que abre **módulo nuevo con tablas nuevas** y toca dinero, inventario y crédito de tienda a la vez. Conviene hacerlo con las otras etapas ya estables.

---

## Lo que pide Pablo

> *"Nos falta una sección para devolución de mercancía, que se pueda obtener la info para devolución a partir de un ticket y si la devolución se hace en efectivo (que afectará la caja) o se da un crédito de tienda."*
>
> **Junta:** *"Aún no metemos nada de caja; se refería a que con la devolución se actualice el inventario."* — *"Puede ser que le devolvamos dinero por algún defecto, sería garantía. En otros casos, si el producto funciona bien, se le devuelve en crédito de tienda. Ambas pueden suceder en cualquier momento posterior a la compra."* — Devolución parcial por artículo: **sí**.

**Estado:** no existe absolutamente nada de devoluciones en el código. Sí existe la infraestructura que hace falta reusar:
- `GET /api/sales/:id` ya devuelve la venta con sus artículos (`sales.service.ts:225-300`: `inventario_id`, `quantity_sold`, `unit_price`, nombres de categoría/subcategoría).
- `client_credit_movements` (migración 033) **ya contempla el tipo `sale_refund`** en sus comentarios — ese es el camino para la devolución en crédito.
- `AdjustStoreCreditModal` / `adjustStoreCredit` ya saben mover el saldo con auditoría.

---

## Reglas de negocio (confirmadas con Pablo)

1. **Devolución parcial por artículo.** Se eligen cuáles artículos del ticket se devuelven y en qué cantidad. El ticket completo es el caso particular de seleccionar todo.
2. **Dos motivos, dos destinos:**
   - **Garantía** (el producto tiene defecto) → se devuelve **dinero** (efectivo). Por defecto el artículo **no reingresa** al inventario (está defectuoso); la cajera puede cambiarlo.
   - **Sin defecto** (el producto funciona bien, el cliente simplemente lo regresa) → se devuelve **crédito de tienda**. Por defecto el artículo **sí reingresa** al inventario.
   - La cajera elige motivo y método; el sistema **solo propone** los valores por defecto, no bloquea combinaciones.
3. **Sin límite de tiempo:** ambas pueden ocurrir en cualquier momento posterior a la compra.
4. **La devolución actualiza el inventario** (eso era lo que Pablo quería decir con "afectar la caja"). **No se construye nada de caja.**
5. **No se permite devolver más de lo vendido** ni devolver dos veces el mismo artículo: se valida contra lo ya devuelto de esa venta.
6. **No se bloquea por cómo se pagó la venta original.** Si se pagó con crédito de tienda y se devuelve en efectivo, el sistema **muestra** cómo se pagó (informativo) pero deja proceder.

## Modelo de datos — migración `047`

```sql
CREATE TABLE returns (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  client_id INTEGER REFERENCES clients(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  return_date TIMESTAMP DEFAULT NOW(),
  total_amount NUMERIC(10,2) NOT NULL,
  refund_method VARCHAR(20) NOT NULL,   -- 'efectivo' | 'credito_tienda'
  location VARCHAR(50),
  return_type VARCHAR(20) NOT NULL,     -- 'garantia' | 'sin_defecto'
  reason TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE return_items (
  id SERIAL PRIMARY KEY,
  return_id INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  sale_item_id INTEGER NOT NULL REFERENCES sale_items(id),
  inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
  quantity_returned INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  restocked BOOLEAN DEFAULT TRUE,
  condition_notes TEXT
);
```
Índices: `returns(sale_id)`, `returns(return_date DESC)`, `returns(client_id)`, `return_items(return_id)`.

**Nota sobre el tipo de `inventario_id`:** copiar exactamente el tipo que usa `sale_items.inventario_id` (los IDs son SKU-based tipo `ANDP123`, no enteros). Es `VARCHAR(50)` (migración 009, línea 29).

---

## Puntos de integración

| Capa | Archivo | Qué hacer |
|------|---------|-----------|
| DB | **migración `047`** | Tablas `returns` y `return_items` (arriba). |
| Modelo API | `packages/api/src/models/` → **nuevo `returns.model.ts`** | `Return`, `ReturnItem`, `CreateReturnDto`, `ReturnQueryParams`. Imitar `sales.model.ts`. |
| Servicio API | **nuevo `packages/api/src/services/returns.service.ts`** | `getSaleForReturn(saleId)` — venta + artículos + **cuánto ya se devolvió de cada uno**. `createReturn(dto)` — **una sola transacción**: insertar `returns`+`return_items`, **sumar stock** en `inventario` para los `restocked`, y si `refund_method='credito_tienda'` acreditar al cliente registrando `client_credit_movements` con `movement_type='sale_refund'`. `getReturns(params)`, `getReturnById(id)`, `getReturnsStats()`. |
| Controller | **nuevo `packages/api/src/controllers/returns.controller.ts`** | Handlers + validación. |
| Rutas | **nuevo `packages/api/src/routes/returns.routes.ts`** + registrar en `routes/index.ts` | `GET /api/returns`, `POST /api/returns`, `GET /api/returns/:id`, `GET /api/returns/stats`, `GET /api/returns/sale/:saleId` (info del ticket para devolver). Permisos: `superadmin, admin, manager, gerente, sales, vendedor`. |
| Servicio front | **nuevo `apps/pos/src/services/returns.service.ts`** | Cliente HTTP, copiando el patrón de `sales.service.ts`. |
| Módulo nuevo | `apps/pos/src/components/modules/DevolucionesModule.jsx` | Contenedor con dos pestañas: **Nueva devolución** / **Historial**. |
| UI nueva | `apps/pos/src/components/returns/NewReturn.jsx` | Flujo: **buscar ticket** (por número de venta o escaneando) → mostrar artículos con lo ya devuelto → seleccionar qué y cuánto → elegir tipo **Garantía** / **Sin defecto** (que preselecciona método y reingreso) → **Efectivo** o **Crédito de tienda** → confirmar. Mostrar cómo se pagó la venta original (informativo). |
| UI nueva | `apps/pos/src/components/returns/ReturnsList.jsx` + `ReturnDetailModal.jsx` | Historial con filtros de fecha/ubicación/método y estadísticas. Copiar `HistorialVentas.jsx`. |
| Navegación | `apps/pos/src/components/POSApp.jsx:11-31`, `:35-62`, `:75-95`, `:120-135` | Registrar el módulo `devoluciones` en los **cuatro** puntos. |
| Historial de ventas | `apps/pos/src/components/sales/HistorialVentas.jsx` (modal de detalle) | Marcar visiblemente las ventas con devolución y ofrecer botón **"Devolver"** desde el detalle. Es el punto natural donde la cajera va a buscarlo. |

---

## Ticket / comprobante de devolución

⏳ **Preguntar a Pablo:** ¿la devolución imprime comprobante?
- Si **no** → esta etapa no toca `apps/print-bridge` y no requiere ir a la PC de la caja.
- Si **sí** → hay que extender el contrato del ticket: `ticket.model.ts` → `ticket.service.ts` → **espejo manual** en `apps/print-bridge/src/types/ticket.types.ts` → nuevo renderer → y **actualizar el print-bridge a mano en la PC de la caja** (`git pull` → `npm run build` → reiniciar servicio de Windows). Suma ~1 día.

---

## Qué NO construir
- **No** construir nada de caja (confirmado en la junta). La devolución en efectivo queda registrada con monto/fecha/usuario en `returns`, y eso es todo.
- **No** tocar `sales` ni `sale_items`: la venta original es histórico y **no se modifica**. La devolución es un registro aparte que la referencia.
- **No** bloquear por método de pago original (decisión de Pablo).
- **No** crear un sistema de ajuste manual de inventario: reusar el mismo UPDATE de stock que ya hace `createSale` (`sales.service.ts:170-182`), en sentido inverso.
- **No** reinventar el movimiento de crédito: reusar `client_credit_movements` con `movement_type='sale_refund'`.
- **No** permitir devoluciones de ventas en línea en esta etapa (`OnlineSalesModule` tiene su propio flujo y sus propias reglas de reembolso con la pasarela). Acotar a ventas de mostrador y decirlo en pantalla.

---

## Migración
Sí — **`047-create-returns-tables.sql`**. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- Buscar una venta por su número, ver sus artículos y devolver **uno solo** de ellos.
- Con "reingresar a inventario": el stock del artículo sube y vuelve a aparecer como disponible en el POS.
- Sin reingresar (dañado): el stock **no** cambia y queda registrado el motivo.
- Devolución en **crédito de tienda**: el saldo del cliente sube por el monto exacto y aparece un movimiento `sale_refund` en su historial.
- Devolución por **garantía** en efectivo: queda registrada con monto, fecha y usuario; por defecto el artículo **no** reingresa.
- Intentar devolver el mismo artículo dos veces, o más cantidad de la vendida: **se rechaza** con mensaje claro.
- El historial de ventas señala la venta como parcialmente devuelta.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + **migración 047 manual vía psql**.
- Frontend: push → Vercel (POS).
- Print-bridge: **solo** si Pablo pide comprobante impreso → actualización manual en la PC de la caja.
