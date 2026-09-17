# Etapa 3 — POS: Clientes (ficha con histórico, edición, notas, crédito)

**Apps:** `apps/pos`, `packages/api`.
**Dev:** ~2.5 días.

---

## Lo que pide Pablo

> *"Dentro de POS poder administrar a los clientes y vendedores (proveedores). Tener una pantalla que permita ver y editar o dar de alta datos de clientes, agregar alguna nota específica si se requiere y editar/ajustar y visualizar si tienen crédito de tienda. (Actualmente me permite ajustar el saldo al hacer una venta pero no puedo consultar previo ni editar algún dato del cliente, solo dar de alta.)"*
>
> **Junta:** *"Solo clientes."* — *"Es poder tener una interfaz para ver cada uno a detalle con su histórico. Cambiar datos de ellos."*

> ⚠️ **La API ya está casi completa.** `packages/api/src/routes/client.routes.ts` ya expone:
> - `GET /api/clients/search`, `GET /api/clients/:id`, `POST /api/clients`, `PUT /api/clients/:id`
> - `POST /api/clients/:id/store-credit/adjust` (admin/manager)
> - `GET /api/clients/:id/store-credit/movements`
>
> Y el POS ya tiene el cliente HTTP completo en `apps/pos/src/services/client.service.ts:47-130`, más `AdjustStoreCreditModal.jsx`.
>
> **Lo que falta es la PANTALLA** y el histórico consolidado. **No reconstruir la API de clientes.**

**Decisión:** no hay entidad "proveedor". Quien vende/consigna ya es un registro en `clients` (`valuations.client_id`). Su histórico de valuaciones y consignaciones se ve **en la misma ficha**.

---

## Item 1 — Módulo "Clientes" en POS

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| API | `packages/api/src/routes/client.routes.ts` + `client.controller.ts` | Añadir **listado paginado** `GET /api/clients` (hoy solo hay `/search`, pensado para autocompletar). Filtros: texto (nombre/teléfono/email), "con crédito > 0"; orden por nombre / crédito / fecha de alta. Reusar el patrón de paginación de `getSales` (`sales.service.ts:404-410`). |
| Módulo nuevo | `apps/pos/src/components/modules/ClientesModule.jsx` | Contenedor del módulo. |
| UI nueva | `apps/pos/src/components/clients/ClientsList.jsx` | Tabla: Nombre, Teléfono, Email, **Crédito en tienda**, Notas (recorte), acciones. Buscador + paginación. Copiar la estructura de `InventoryList.jsx`. |
| UI nueva | `apps/pos/src/components/clients/ClientFormModal.jsx` | Alta y edición (mismo formulario). Reusar validaciones de `ClientSelection.jsx`. |
| Reuso | `apps/pos/src/components/modules/AdjustStoreCreditModal.jsx` | **Reusar tal cual** para ajustar saldo desde la ficha. Ya escribe en `client_credit_movements` (migración 033) y respeta permisos admin/manager. |
| Navegación | `apps/pos/src/components/POSApp.jsx:11-31` (`renderModule`), `:35-62` (`moduleIcons`), `:75-95` y `:120-135` (menús) | Registrar el módulo `clientes` en los **cuatro** puntos (switch, iconos, menú escritorio, menú móvil). |

---

## Item 2 — Ficha del cliente con histórico completo

Es el corazón de la petición. Un solo componente `ClientDetailModal.jsx` (o página) con **secciones apiladas**:

| Sección | Fuente de datos | Estado |
|---------|-----------------|--------|
| **Datos** (nombre, teléfono, email, identificación, notas) + botón Editar | `GET /api/clients/:id` | ✅ existe |
| **Crédito en tienda**: saldo + botón Ajustar + tabla de movimientos | `GET /api/clients/:id/store-credit/movements` | ✅ existe |
| **Compras** (ventas de mostrador) | `GET /api/sales?client_id=` (`sales.service.ts:355` ya filtra por cliente) | ✅ existe |
| **Ventas / valuaciones** (lo que nos vendió) | `GET /api/valuations?client_id=` (`valuation.controller.ts:206` ya lo acepta) | ✅ existe |
| **Consignaciones** con estatus | `GET /api/consignments?client_id=` (`consignment.service.ts:69` ya filtra) | ✅ existe |
| **Apartados** (monto apartado / saldo pendiente / vencimiento) | Etapa 5 — `GET /api/layaways?client_id=` | ⏳ se deja la sección con "Próximamente" hasta la Etapa 5 |

**Recomendación:** un endpoint agregador `GET /api/clients/:id/summary` que devuelva contadores y totales (compras, crédito, consignaciones activas, apartados activos) para el encabezado de la ficha, y las tablas por sección se cargan con los endpoints existentes al abrir cada pestaña. Evita 5 llamadas al abrir la ficha.

### Puntos de integración

| Capa | Archivo | Qué hacer |
|------|---------|-----------|
| API | `client.controller.ts` + `client.routes.ts` | `GET /api/clients/:id/summary` (contadores y totales). |
| UI nueva | `apps/pos/src/components/clients/ClientDetailModal.jsx` | Encabezado con resumen + pestañas por sección. |
| Servicio front | `apps/pos/src/services/client.service.ts` | `listClients`, `getClientSummary`. Para ventas/valuaciones/consignaciones **reusar** los servicios existentes (`sales.service.ts`, `consignment.service.ts`) pasándoles `client_id`. |

---

## Item 3 — Notas del cliente

**Falta en la base de datos:** la tabla `clients` (esquema consolidado, líneas 116-126) tiene `name, phone, email, identification, is_active` — **no tiene `notes`**.

| Capa | Archivo | Qué hacer |
|------|---------|-----------|
| DB | **migración `046-add-client-notes.sql`** | `ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;` |
| API | `client.controller.ts` (`createClient`, `updateClient`, `getClient`, `searchClients`) | Incluir `notes` en INSERT / UPDATE / SELECT. |
| Front | `apps/pos/src/services/client.service.ts` (`Client`, `CreateClientData`) | Añadir `notes?: string`. |
| UI | `ClientFormModal.jsx` / `ClientDetailModal.jsx` | Textarea de notas. |

---

## Qué NO construir
- **No** crear entidad/tabla/bandera de proveedor (decisión de Pablo: solo clientes).
- **No** duplicar la lógica de ajuste de crédito: reusar `AdjustStoreCreditModal` y el endpoint existente.
- **No** crear endpoints nuevos de ventas/valuaciones/consignaciones por cliente: los tres ya filtran por `client_id`.
- **No** implementar apartados aquí: solo dejar la sección prevista (Etapa 5).

---

## Migración
Sí — **`046-add-client-notes.sql`**. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- Buscar un cliente existente, abrir su ficha, **editar su teléfono y guardar**.
- Agregarle una nota y verla al reabrir la ficha.
- Ver su saldo de crédito y el historial de movimientos **sin tener que iniciar una venta**.
- Ajustar el saldo desde la ficha (con usuario admin) y ver el movimiento nuevo en el historial.
- Ver en la ficha sus compras, lo que nos ha vendido y sus consignaciones con estatus.
- Dar de alta un cliente nuevo desde el módulo (no desde una venta).

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + **migración 046 manual vía psql**.
- Frontend: push → Vercel (POS).
