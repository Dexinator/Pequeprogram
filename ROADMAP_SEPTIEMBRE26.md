# Roadmap — Mejoras Sistema Septiembre 26

> **Origen:** documento "Mejoras sistema septiembre26.docx" (Pablo) + junta de aclaraciones con Pablo (septiembre 2026).
> **Método:** igual que Junio26 — **sesión máster** (esta) define fichas cerradas con puntos de integración exactos; **cada etapa se implementa en sesión aparte** contra su ficha.

## Reglas de trabajo (heredadas de Junio26)

1. **Todo va primero a STAGING** (backend + frontend). Pablo prueba y da luz verde → recién ahí a producción.
2. **Cada etapa = una sesión de implementación aparte**, tomando su ficha como spec cerrada.
3. Esta sesión máster **no implementa**: define fichas y puntos de integración.
4. Cada ficha declara explícitamente **QUÉ NO construir** (reusar X, no crear Y).

## Orden propuesto

> Criterio: primero lo que es *fricción diaria en caja* y cuesta poco; al final lo que abre módulo nuevo con base de datos nueva.

| Etapa | Módulo | Ficha | Dev aprox. |
|-------|--------|-------|------------|
| 0 | Fixes: paginación "Preparar productos" + 3 bugs de Slack (401 en citas, alta de cliente en POS, clientes de citas invisibles) | [etapa-0-fixes.md](roadmap-septiembre26/etapa-0-fixes.md) | ~0.5 día ✅ hecho |
| 1 | POS — Cobro: pago mixto, cambio en efectivo (con ticket), calculadora | [etapa-1-pos-cobro.md](roadmap-septiembre26/etapa-1-pos-cobro.md) | ~2.5 días |
| 2 | POS — Inventario: filtros + catálogo de claves | [etapa-2-pos-inventario.md](roadmap-septiembre26/etapa-2-pos-inventario.md) | ~1.5 días |
| 3 | POS — Clientes: ficha con histórico completo, edición, notas, crédito | [etapa-3-clientes.md](roadmap-septiembre26/etapa-3-clientes.md) | ~2.5 días |
| 4 | POS — Devoluciones de mercancía (garantía / crédito) | [etapa-4-devoluciones.md](roadmap-septiembre26/etapa-4-devoluciones.md) | ~3 días |
| 5 | POS — Sistema de apartados | [etapa-5-apartados.md](roadmap-septiembre26/etapa-5-apartados.md) | ~3.5 días |

**Dev puro ≈ 12–13 días hábiles.** Con ciclos de prueba de Pablo: **~5 semanas de calendario** (~3.5 si la retroalimentación es rápida).

Dependencia: la **Etapa 5 (apartados) va después de la 3 (clientes)** porque la ficha del cliente es donde se consultan sus apartados.

La Etapa 0 ya está implementada (sesión 2026-09-17) y sube a staging por su cuenta para que Pablo tenga algo que probar de inmediato.

## Deploy a staging (aplica a toda etapa que toque API)

- **Frontend:** push a la rama → **Vercel** auto-deploya.
- **Backend:** `git subtree push` desde `packages/api` → **Heroku** (staging).
- **Migraciones:** manuales vía `psql` (el `npm run migrate` de Heroku está roto). Cada ficha que agrega columna/tabla indica su migración.
- **Números de migración asignados** (existen 001–044; hay dos `032-*`):
  - `044` — Etapa 0: backfill de clientes desde citas (**ya escrita y probada en local**)
  - `045` — Etapa 1: `sales.cash_received` / `sales.change_given`
  - `046` — Etapa 3: `clients.notes`
  - `047` — Etapa 4: `returns` / `return_items`
  - `048` — Etapa 5: `layaways` / `layaway_items` / `layaway_payments`
- ⚠️ **Print-bridge:** servicio local en la PC de la caja (`localhost:9443`), NO se despliega por Vercel/Heroku. **La Etapa 1 lo toca** (el cambio va en el ticket): hay que actualizarlo manualmente en esa PC: `git pull` → `npm run build` → reiniciar el servicio de Windows. Etapas 4 y 5 solo si Pablo pide comprobante impreso.

## Estado del mapeo: qué ya existe y qué no

Revisión hecha contra el código antes de escribir las fichas. Esto evita reconstruir cosas.

| Petición del documento | Estado real en el código |
|---|---|
| Pago mixto: decir cuánto falta | ❌ Hoy solo dice "no coincide" (`PaymentMethod.jsx:63-64`). Falta el faltante/sobrante. |
| Efectivo: capturar monto y calcular cambio | ❌ No existe captura de monto recibido en efectivo simple. |
| Inventario: filtro por categoría/producto | ⚠️ **La API ya lo soporta** (`searchInventory` acepta `category_id`/`subcategory_id`, `sales.service.ts:495-503`). Falta **solo la UI**. |
| Inventario: filtro "No disponibles" | ❌ Hoy `available_only` es booleano (disponibles/todos). Necesita tri-estado en API + UI. |
| Devoluciones desde ticket | ❌ No existe nada. Módulo nuevo + tablas nuevas. |
| Calculadora | ❌ No existe. |
| Administrar clientes (ver/editar/notas/crédito) | ⚠️ **La API está casi completa**: `GET/PUT /api/clients/:id`, `POST /:id/store-credit/adjust`, `GET /:id/store-credit/movements` (`client.routes.ts`). Falta **pantalla en POS**, listado paginado y columna `notes`. |
| Administrar proveedores | ✅ Resuelto: **solo clientes**, no hay entidad proveedor aparte. Quien vende/consigna ya es un registro en `clients`; su histórico de valuaciones/consignaciones se muestra en la misma ficha. |
| Catálogo de claves (AUTP, ANDP…) | ⚠️ El dato ya existe: `subcategories.sku`. Falta **solo pantalla de consulta**. |
| Apartados (layaway) | ❌ No existe nada (ni concepto de reserva de stock). En la junta Pablo lo **incluyó en esta ronda** → Etapa 5, módulo nuevo con tablas nuevas. |
| Preparar productos: no se ve la página 1 | ❌ Bug confirmado: `ProductPreparation.jsx:741` pinta **todos** los botones de página sin ventana ni scroll → con 13+ páginas la 1 queda fuera de pantalla. |

## Decisiones tomadas con Pablo (junta de aclaraciones)

1. ✅ **Proveedores:** **solo clientes.** No se crea entidad ni bandera de proveedor. La ficha del cliente muestra su histórico completo (compras, ventas/valuaciones, consignaciones, crédito, apartados) y permite editar sus datos.
2. ✅ **Cambio en efectivo:** **sí se toma en cuenta** → se guarda en la venta y **sale en el ticket**. Esto convierte la Etapa 1 en una etapa con migración + print-bridge. También confirmado: en pago mixto decir cuánto falta para cubrir el total.
3. ✅ **"Afectar la caja" en devoluciones:** **no se mete nada de caja.** Lo que Pablo quería decir es que **la devolución actualiza el inventario**. El corte de caja sigue parkeado.
4. ✅ **Devolución en efectivo vs. crédito:** **ambas son válidas en cualquier momento posterior a la compra.** Regla de negocio: si el producto tiene **defecto → garantía → se devuelve dinero**; si el producto **funciona bien → crédito de tienda**. La cajera elige; el sistema no bloquea por cómo se pagó la venta original.
5. ✅ **Devolución parcial por artículo:** sí.
6. ✅ **Apartados:** entra en esta ronda como **Etapa 5**.

### Dudas menores que quedan (no bloquean el arranque)

- **E4:** ¿la devolución imprime comprobante? Se asume **no** hasta que Pablo lo pida (si sí, +1 día y toca print-bridge).
- **E5:** ¿el apartado imprime comprobante de abono? Se asume **sí, un ticket simple de abono** (es lo que el cliente se lleva como constancia). Confirmar.
- **E5:** ¿hay plazo máximo de apartado y anticipo mínimo? Se asume **configurable pero sin bloqueo** (el sistema muestra vencidos, no cancela solo). Confirmar.

## Ítems parkeados (fuera de esta ronda)

Del propio documento, sección "Pendiente por definir":

- **POS — Corte de caja** (sigue parkeado desde Junio26; Pablo lo documentará aparte). Confirmado en la junta: en esta ronda **no se mete nada de caja**.
- **Reportes** de ventas (categoría/subcategoría/fecha/cliente), de compras (costos por categoría), de inventario, de consignaciones con estatus.
- **Perfiles / administración de sistema.**
- **Conexión con Mercado Pago y Amazon.** (Nota: ya hay integración de pagos en línea — `onlinePayment.controller.ts` y `VERIFICACION_MERCADOPAGO.md`; habría que revisar qué falta exactamente antes de estimar.)
- **Terminal: tickets de venta y escáner en ambas máquinas de la tienda.** No es desarrollo: es instalar/configurar **print-bridge** y el escáner en la segunda PC. Requiere definir con Pablo (¿qué máquina?, ¿misma impresora en red o una por caja?).
