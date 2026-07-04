# Etapa 5 — Tienda: errores críticos

**Apps:** `apps/tienda`, `packages/api`. Bugs que afectan ventas/envíos.

---

## Item 12 — Pesos afectando costo de envío

**Objetivo:** que el envío se calcule con el peso real del producto.

> **Root cause identificado:** las unidades sí son consistentes (gramos en todo, la API divide entre 1000). El defecto real: **el item del carrito nunca lleva el peso**, así que cada línea cae al default de **500 g**.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/context/CartContext.tsx:4-13` (`CartItem`) | Añadir `weight_grams` a la interfaz. |
| `CartContext.tsx:115-145` (`addItem`, especialmente `:130-139`) | Copiar `weight_grams` del producto al item (el producto ya lo trae: `store.service.ts:23`). |
| `apps/tienda/src/pages/checkout.astro:814-817,828` | Ya suma `item.weight_grams` (hoy undefined → 500). Con el fix, usará el real. |
| `packages/api/src/controllers/shipping.controller.ts:71,108-117` | **No tocar:** conversión g→kg y match de tarifas están bien. |

### Qué NO construir
- No cambiar la API de envío ni la captura de peso. Solo propagar `weight_grams` al carrito.

---

## Item 13 — Correo de confirmación no llega

**Objetivo:** que el cliente reciba el correo de confirmación de compra.

> Servicio: **Resend** (`email.service.ts`). El envío es fire-and-forget y los errores se tragan (solo log).

### Puntos de integración / hipótesis de causa

| Archivo / línea | Nota |
|-----------------|------|
| `packages/api/src/services/email.service.ts:432` (`from` hack `citas@`→`tienda@`) | Si `EMAIL_FROM` no contiene `citas@`, el replace no aplica; y `tienda@mail.entrepeques.mx` debe estar **verificado en Resend** (SPF/DKIM) o se filtra como spam. **Causa más probable.** |
| `email.service.ts:53-56,420-424` | Si `RESEND_API_KEY` no está seteada, el envío se salta silenciosamente. |
| `onlinePayment.controller.ts:379` (`customerEmail: payer?.email`) + guard `email.service.ts:429` | Si `payer.email` viene vacío, no se manda al cliente (la interna sí → "nosotros lo recibimos, el cliente no"). Endurecer. |
| `onlinePayment.controller.ts:376,388-391` | Trigger fire-and-forget; los errores solo se loguean. |

### Qué NO construir
- No reescribir el servicio de correo: arreglar el `from` (`:432`), verificar dominio en Resend, y endurecer el caso `payer.email` vacío.

---

## Item 14 — "Volver al carrito" muestra vacío (desktop)

**Objetivo:** que la página `/carrito` muestre el carrito (hoy sale vacío en desktop).

> **Root cause:** `carrito.astro:16` monta `CartPage` como isla `client:only` **sin `CartProvider`**. Como cada isla Astro es un root React aislado, el provider del NavBar no alcanza a `CartPage`. Por eso funciona el drawer móvil (dentro del provider del NavBar) pero no `/carrito` desktop.

### Puntos de integración

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/pages/carrito.astro:16` | Envolver `CartPage` en `CartProvider` (reusar patrón `AppProviders.jsx:8` / `LayoutWrapper.jsx:9` / `PageWrapper.jsx`). |
| `CartContext.tsx:69,103-108` | Ya inicializa desde `localStorage` correctamente — no tocar. |

### Qué NO construir
- No modificar `CartPage.jsx` ni `CartContext.tsx`: solo envolver la isla con el provider.

---

## Migración
- Ninguna.

## Criterio de aceptación (staging)
- El envío cambia según el peso real del producto. Una compra de prueba genera correo al cliente. `/carrito` en desktop muestra los productos agregados.

## Deploy
- Backend: `git subtree push` `packages/api` → Heroku (para envío/correo). Frontend: push → Vercel (tienda). Verificar dominio de Resend y env vars en Heroku staging.
