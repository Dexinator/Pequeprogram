# Etapa 6 — Tienda: contenido y navegación

**Apps:** `apps/tienda`. Cambios de contenido/UX, bajo riesgo, se prueban visualmente.

---

## Item 17 — Mostrar talla de ropa

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/components/shop/ProductDetailRedesigned.jsx:415-433` (grid "Características") | Añadir fila "Talla". El dato vive en `valuation_items.features.talla` (seteado en valuador `ClothingProductForm.jsx:146`). El grid ya itera `product.features` (`:434-443`); extraer `talla` con label propio. |

> **Nota:** el componente activo es `ProductDetailRedesigned.jsx` (no `ProductDetail.jsx`). Verificar que `talla` llegue dentro de `product.features` en el payload de la tienda.

---

## Item 18 — Reacomodar iconos de "a pasear"

**Objetivo:** mover el icono de "otros de paseo" a "cargando al peque"; usar mochila para "otros paseo" y sombrilla para "accesorios carriola".

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/data/categoryGroupsComplete.js:20` (`Cargando al peque` → `baby-carrier`) | Reasignar icono. |
| `categoryGroupsComplete.js:34` (`Accesorios Carriola y Auto` → `accessories`) | → sombrilla. |
| `categoryGroupsComplete.js:54` (`Otros de paseo` → `other-travel`) | → mochila. |
| Render: `apps/tienda/src/components/shop/Subcategories.jsx:264,294` (`/icons/ep-${icon}.svg`) | Sin cambio de código. |
| **Assets** `/public/icons/` | ⚠️ Faltan `ep-baby-carrier.svg` y `ep-accessories.svg` (referenciados pero ausentes). **Crear los SVG** antes. |

---

## Item 19 — Botón "Visita nuestra tienda CDMX" (queda arribita)

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/components/shop/Subcategories.jsx:354-359` (`href="/#tienda"`) | Sin cambio del href. |
| `apps/tienda/src/components/shop/VisitUsSection.jsx:25` (`<section id="tienda">`) | Añadir `scroll-mt-*` (compensar el header fijo). |

---

## Item 20 — WhatsApp de "Contáctanos" no funciona

> **Hallazgo:** el link no es de WhatsApp, es `tel:5565883245` (otro número).

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/components/shop/Subcategories.jsx:348-353` (`href="tel:5565883245"`) | Cambiar a `https://wa.me/525523632389?text=...` como los que sí jalan (`VisitUsSection.jsx:119`, `RentalSection.jsx:127`). |

---

## Item 15 — Texto "Trae tus artículos" (martes y jueves)

| Archivo / línea | Qué hacer |
|-----------------|-----------|
| `apps/tienda/src/components/shop/CTASection.jsx:48-49` | Añadir "martes y jueves de 11:00am a 5:30pm" al body (`:49`). |

---

## Item 16 — Actualizar video del proceso de ventas

> **No es trabajo de código (por ahora).** Es un `videoId` de YouTube hardcodeado (`tw2yvkna2ww`) en `CTASection.jsx:72` → `VideoModal.jsx:56`. El video actual muestra contenido del sitio anterior.

| Paso | Qué hacer |
|------|-----------|
| Externo | Producir/editar el video nuevo (Pablo tenía cotización pagada pendiente; Jorge debe revisar si es solo cortar o regrabar). |
| `CTASection.jsx:72` | Una vez exista, cambiar el `videoId`. |

> **Bloqueado por asset externo** — no bloquea el resto de la etapa.

---

## Migración
- Ninguna.

## Criterio de aceptación (staging)
- La talla aparece en el detalle de ropa. Iconos de "a pasear" correctos (con assets creados). El botón CDMX cae justo en la sección de tienda física. El WhatsApp de "no encuentras" abre WhatsApp. El texto muestra martes/jueves. (Video: pendiente de asset.)

## Deploy
- Frontend: push → Vercel (tienda). Sin backend.
