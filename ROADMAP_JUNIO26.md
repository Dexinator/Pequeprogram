# Roadmap — Cambios Sistema Junio 26

> **Origen:** documento "Cambios sistema junio26.docx" + junta con Pablo del 2026-07-01 (transcripción Fireflies).
> **Objetivo de este roadmap:** que cada implementación se ejecute en **sesión aparte** contra una **ficha cerrada** con puntos de integración exactos, para evitar reconstruir módulos completos.

## Reglas de trabajo acordadas

1. **Todo va primero a STAGING** (backend + frontend). Pablo prueba y da **luz verde** → recién ahí se sube a producción. No acumular versiones sin probar.
2. **Cada etapa = una sesión de implementación aparte**, tomando su ficha como spec cerrada.
3. **Sesión máster (esta):** define/revisa las fichas y los puntos de integración. No implementa.
4. Cada ficha declara explícitamente **QUÉ NO construir** (reusar X, no crear Y).

## Orden acordado con Pablo

> **POS → Valuador → Tienda en línea (al final).** Pablo no quiere tardar en llegar a POS/Valuador.

| Etapa | Módulo | Ficha | Dev aprox. |
|-------|--------|-------|------------|
| 1 | POS | [etapa-1-pos.md](roadmap-junio26/etapa-1-pos.md) | ~2 días |
| 2 | Valuador — flujo de compra | [etapa-2-valuador-compra.md](roadmap-junio26/etapa-2-valuador-compra.md) | ~3–3.5 días |
| 3 | Valuador — consignaciones | [etapa-3-consignaciones.md](roadmap-junio26/etapa-3-consignaciones.md) | ~1.5 días |
| 4 | Notas + preparar productos | [etapa-4-notas-preparar.md](roadmap-junio26/etapa-4-notas-preparar.md) | ~3 días |
| 5 | Tienda — errores críticos | [etapa-5-tienda-errores.md](roadmap-junio26/etapa-5-tienda-errores.md) | ~2 días |
| 6 | Tienda — contenido y navegación | [etapa-6-tienda-contenido.md](roadmap-junio26/etapa-6-tienda-contenido.md) | ~2 días |

**Dev puro ≈ 13–14 días hábiles.** Con ciclos de prueba de Pablo (~1 semana por bloque): **~5 semanas de calendario** (o ~3 si la retroalimentación es rápida).

## Deploy a staging (aplica a toda etapa que toque API)

- **Frontend:** push a la rama → **Vercel** auto-deploya.
- **Backend:** `git subtree push` desde `packages/api` → **Heroku** (staging).
- **Migraciones:** manuales vía `psql` (el `npm run migrate` de Heroku está roto). Cada ficha que agrega columna/tabla indica su migración.
- **Staging aislado ya existe** (confirmado por Jorge) → Pablo prueba sin tocar producción.

## Dudas de producto pendientes con Pablo

Resueltas por el mapeo de código o pendientes de confirmar. Ver detalle en cada ficha.

1. ✅ **Consignación 50% (E3):** cambiar **display + valor guardado** al 50% del precio de venta (contrato e historial consistentes) y **unificar la ropa** (hoy compra×1.2) al mismo criterio. El pago real al proveedor NO se afecta (se calcula aparte con `sale_price real × %`).
2. ✅ **Borrador de compra (E2):** guardar **todo** el estado y **recuperarlo tal cual se quedó** (reusa `status='pending'` + path de rehidratación de `NuevaValuacion`).
3. ✅ **Descuento POS (E1):** sobre el **total** de la venta; **sí aparece en reportes/estadísticas** además del ticket.
4. ✅ **Subcategorías Juguetes (E2):** ocultar (`is_active=false`, no borrar) los IDs **8** (sobre ruedas) y **6** (triciclos y bicicletas).

## Ítems parkeados (fuera de esta ronda)

- **POS — Corte de caja** (saldo inicial, ventas/compras, cuadre, uno/dos cajeros, estilo Microsip/My Business). Pablo lo documentará por separado.
