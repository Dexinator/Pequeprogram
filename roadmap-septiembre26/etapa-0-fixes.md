# Etapa 0 — Fixes: paginación de "Preparar productos" + bugs reportados por Slack

**Apps:** `apps/tienda`, `apps/pos`, `packages/api`.
**Dev:** ~0.5 día. **✅ Implementada el 2026-09-17** (ver Current_State.md).
**Origen:** el documento (paginación) + mensajes de Pablo en Slack del 2026-09-17 (tres bugs).

---

## Item — No se ve la página 1 del historial

> **Pablo:** *"Las hojas de historial se ven a partir de la 12 o 13, no aparece la número 1 en la pantalla de la pc."*

**Causa confirmada:** `ProductPreparation.jsx:741` renderiza **un botón por cada página existente**, sin ventana ni scroll:

```jsx
{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (...))}
```

Con `limit: 12` y cientos de productos salen 20–40 botones en un `flex justify-center` sin `flex-wrap` ni `overflow`. La fila se centra y **se desborda por ambos lados**: en la pantalla de la PC de la tienda las primeras páginas quedan cortadas fuera del viewport. No es que falte la página 1 — está fuera de pantalla.

**Nota:** el mismo componente `ProductManagement.jsx:397-404` **ya resuelve esto bien** (ventana de 5 páginas + botones Anterior/Siguiente). Ese es el patrón a copiar.

### Puntos de integración

| Capa | Archivo / línea | Qué hacer |
|------|-----------------|-----------|
| UI | `apps/tienda/src/components/ProductPreparation.jsx:739-756` | Reemplazar el bloque de paginación por una **ventana de páginas** + botones **Anterior / Siguiente** + indicador "Página X de Y". Copiar la lógica de `ProductManagement.jsx:387-430`. |

**Detalle mínimo esperado:**
- Ventana de 5 páginas alrededor de la actual (nunca más de 5 botones numéricos).
- Botones `« Anterior` / `Siguiente »` deshabilitados en los extremos.
- Texto "Página {filters.page} de {pagination.totalPages}".
- Contenedor con `flex-wrap` para que nunca se salga del ancho aunque cambie el diseño.

### Qué NO construir
- **No** crear un componente de paginación compartido ni refactorizar `ProductManagement.jsx`. Copiar el patrón que ya funciona y ya.
- **No** tocar la API: la paginación del backend funciona correctamente.
- **No** cambiar `limit: 12`.

---

## Bug Slack 1 — Citas: "API error 401 no autorizado" al rato de estar trabajando

> **Pablo:** *"En el sistema de citas al principio me deja ver los datos del cliente pero en algún momento ya no me deja verlos… me sale un error que dice Api error 401 no autorizado. Ya lo hice dos veces y me hace el mismo error."*

**Causa confirmada:** el `AuthContext` de la tienda (`apps/tienda/src/context/AuthContext.tsx`) solo verificaba que existiera un token en localStorage, sin mirar su expiración (JWT de 24h). Es exactamente el bug que se arregló en el POS el 21/08 (`c2e3feb`), pero la tienda no recibió el fix. Cambiar de pestaña no es la causa: es simplemente el momento en que el token venció.

| Archivo | Qué se hizo |
|---------|-------------|
| `apps/tienda/src/services/auth.service.ts` | `isTokenExpired()` (lee el `exp` del JWT) y `isAuthenticated()` lo usa. Portado del POS. |
| `apps/tienda/src/context/AuthContext.tsx` (`checkAuth`) | Token vencido → limpia sesión y muestra login. |
| `apps/tienda/src/services/api.js` (`fetchApi`) | 401 en petición autenticada → limpia sesión y redirige a `/login?return=…&expired=1`. Además ahora lee el `message` del API en errores (antes solo "API Error: 400"). |
| `apps/tienda/src/components/auth/LoginContainer.jsx` | Con `?expired=1` muestra "Tu sesión expiró. Vuelve a iniciar sesión". |

## Bug Slack 2 — POS: "a veces no me deja registrar un cliente y me marca error de API"

> **Pablo:** *"También me hace un error similar cuando estoy registrando un nuevo cliente en el punto de venta, a veces no me deja registrar y me marca también un error de API."*

**Causas confirmadas (dos):**
1. `clients.phone` es `NOT NULL` en la base de datos, pero el formulario del POS dejaba el teléfono opcional → el INSERT fallaba.
2. **Causa raíz general:** el middleware de errores del API (`packages/api/src/index.ts`) respondía **siempre 500 "Error interno del servidor"**, ignorando el `res.status(400)` + mensaje que ponen los controllers (144 lugares usan ese patrón). Un teléfono duplicado se veía como error interno sin explicación.

| Archivo | Qué se hizo |
|---------|-------------|
| `packages/api/src/index.ts` (error middleware) | Si el controller fijó un 4xx, se respeta y se devuelve `err.message`. **Beneficia a todos los endpoints.** |
| `packages/api/src/controllers/client.controller.ts` (`createClient`) | Teléfono obligatorio (400 con mensaje claro); duplicado → **409** `PHONE_EXISTS` con los datos del cliente existente; mensajes en español. Duplicado y búsqueda comparan **solo dígitos** ("55 1234 5678" = "5512345678"). |
| `apps/pos/src/services/http.service.ts` | `toError()` centralizado: lee `message`/`code`/`data` del API en GET/POST/PUT/DELETE (PUT y DELETE ni leían el cuerpo). **401 a media jornada → limpia sesión y recarga** para que aparezca el login. |
| `apps/pos/src/components/sales/ClientSelection.jsx` | Teléfono marcado obligatorio; si el teléfono ya existe muestra el mensaje **y un botón "Usar a {nombre}"** que selecciona al cliente existente. |

## Bug Slack 3 — "Hay clientes que hicieron cita y los busco por teléfono y no me da sus datos"

> **Pablo:** *"Y tampoco respeta los registros de clientes: hay clientes que hicieron cita y los busco por teléfono y no me da sus datos."*

**Causa confirmada:** `createAppointment` guardaba nombre/teléfono/email de un cliente nuevo **solo en la tabla `appointments`** (`client_id = NULL`) y **nunca creaba el registro en `clients`**. Por eso no existían para el POS ni el valuador.

| Archivo | Qué se hizo |
|---------|-------------|
| `packages/api/src/services/appointment.service.ts` | Nuevo `findOrCreateClient()` dentro de la transacción de la cita: busca por dígitos del teléfono; si existe lo vincula, si no lo crea. Dos citas con el mismo teléfono en distinto formato → **un solo cliente**. |
| **Migración `044-link-appointments-to-clients.sql`** | Backfill de las citas históricas: vincula las que ya tenían cliente por teléfono y crea los que faltaban. Probada en copia de staging: 5 citas sin cliente → 4 vinculadas a clientes existentes + 1 cliente nuevo, 0 pendientes. |

---

## Migración
Sí — **`044-link-appointments-to-clients.sql`**. Aplicar en staging vía `psql`.

## Criterio de aceptación (staging)
- **Paginación:** en "Preparar productos" con 13+ páginas se ve la actual, se llega a la 1 con "Anterior" o con el botón, nada se sale de la pantalla de la PC de la tienda.
- **Citas 401:** con la sesión vencida, al entrar a citas aparece el login con "Tu sesión expiró" en vez del error. Con sesión válida, cambiar Categorías ↔ Citas programadas funciona normal.
- **Alta de cliente en POS:** sin teléfono → mensaje claro. Con teléfono ya registrado → "Ya existe un cliente con ese teléfono: X" + botón para usarlo. Con datos correctos → se registra.
- **Clientes de citas:** agendar una cita con cliente nuevo desde la tienda y después buscarlo por teléfono en el POS: aparece. Las citas viejas de Pablo también encuentran a sus clientes.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku staging + **migración 044 manual vía psql**.
- Frontend: push → Vercel (tienda y POS).
