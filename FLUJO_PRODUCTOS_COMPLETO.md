# Flujo Completo de Productos - Sistema Entrepeques

## 📋 Resumen del Flujo
Los productos atraviesan un proceso completo desde su valuación inicial hasta su venta, ya sea en tienda física o en línea.

## 🔄 Flujo Detallado

### 1️⃣ **VALUACIÓN INICIAL** (App Valuador)
**Ubicación:** `apps/valuador`
**Proceso:**
1. Se registra cliente o se busca existente
2. Se crean productos con sus características
3. Se calcula precio de compra y venta sugerido
4. Se finaliza la valuación con modalidad (compra directa/crédito/consignación)

**Endpoints involucrados:**
- `POST /api/valuations/finalize-complete` - Crea valuación completa con items
- `POST /api/valuations` - Crea valuación vacía
- `POST /api/valuations/:id/items` - Agrega items a valuación
- `PUT /api/valuations/:id/finalize` - Finaliza valuación

**Tablas afectadas:**
- `clients` - Información del cliente
- `valuations` - Registro principal de valuación
- `valuation_items` - Productos valuados (estado inicial: `online_store_ready = false`)
- `inventario` - Se crea registro con ID automático (SKU + número)

**Campos clave en `valuation_items`:**
```sql
- id (auto-incremental)
- valuation_id
- category_id, subcategory_id, brand_id
- status, modality, condition_state
- final_purchase_price, final_sale_price
- online_store_ready (DEFAULT false)
- location (DEFAULT 'Polanco')
```

### 2️⃣ **DISPONIBILIDAD EN TIENDA FÍSICA** (App POS)
**Ubicación:** `apps/pos`
**Proceso:**
- Productos disponibles inmediatamente después de valuación
- Se pueden vender sin preparación adicional
- El inventario se actualiza automáticamente

**Endpoints involucrados:**
- `GET /api/inventory/search` - Buscar productos
- `GET /api/inventory/available` - Productos con stock > 0
- `POST /api/sales` - Crear venta física

**Tablas afectadas:**
- `inventario` - Se reduce quantity al vender
- `sales` - Registro de venta
- `sale_items` - Detalle de productos vendidos
- `payment_details` - Detalles de pago

### 3️⃣ **PREPARACIÓN PARA TIENDA ONLINE** (App Tienda - `/preparar-producto`)
**Ubicación:** `apps/tienda/src/pages/preparar-producto.astro`
**Proceso:**
1. Lista productos pendientes (`online_store_ready = false`)
2. Usuario agrega peso, imágenes y precio online
3. Se marca como listo para tienda online

**Endpoints involucrados:**
- `GET /api/store/products/pending` - Lista productos no preparados
- `GET /api/store/products/:id/prepare` - Obtiene detalles para preparación
- `PUT /api/store/products/:id/prepare` - Actualiza producto con datos online
- `POST /api/store/upload-images` - Sube imágenes a AWS S3

**Tablas afectadas:**
- `valuation_items` - Se actualiza:
  - `online_store_ready = true`
  - `weight_grams` - Peso en gramos
  - `online_price` - Precio de venta online
  - `images` - URLs de imágenes en S3
  - `online_prepared_by` - Usuario que preparó
  - `online_prepared_at` - Fecha de preparación

**Campos agregados en migración 018:**
```sql
ALTER TABLE valuation_items ADD:
- weight_grams INTEGER
- online_price NUMERIC(10,2)
- online_prepared_by INTEGER (FK a users)
- online_prepared_at TIMESTAMP
```

### 4️⃣ **DISPONIBILIDAD EN TIENDA ONLINE** (App Tienda - Pública)
**Ubicación:** `apps/tienda`
**Proceso:**
- Solo productos con `online_store_ready = true` son visibles
- Clientes pueden ver catálogo, buscar y filtrar
- Se muestran imágenes desde S3

**Endpoints involucrados:**
- `GET /api/store/products/ready` - Lista productos listos (público)
- `GET /api/store/products/:id/detail` - Detalle de producto (público)
- `GET /api/store/products/:id/related` - Productos relacionados
- `GET /api/store/products/featured` - Productos destacados

**Filtros disponibles:**
- category_id, subcategory_id
- min_price, max_price
- search (búsqueda de texto)
- Paginación

### 5️⃣ **VENTA ONLINE** (App Tienda - Checkout)
**Ubicación:** `apps/tienda`
**Proceso:**
1. Cliente agrega productos al carrito
2. Procede al checkout con MercadoPago
3. Se procesa pago con tarjeta
4. Se actualiza inventario y se registra venta

**Endpoints involucrados:**
- `POST /api/online-payments/process` - Procesa pago con MercadoPago
- `POST /api/online-payments/webhook` - Webhook de MercadoPago
- `GET /api/online-payments/status/:paymentId` - Estado de pago

**Tablas afectadas (migración 020):**
- `online_sales` - Registro de venta online
  - payment_id (único de MercadoPago)
  - customer_email, customer_name, customer_phone
  - shipping_address (JSONB)
  - total_amount, payment_status, payment_method
  - payment_date
- `online_sale_items` - Detalle de productos vendidos
  - online_sale_id (FK)
  - valuation_item_id (FK)
  - quantity, unit_price, subtotal
- `inventario` - Se reduce quantity

## 📊 Diagrama de Estados del Producto

```
VALUACIÓN → INVENTARIO FÍSICO → PREPARACIÓN ONLINE → TIENDA ONLINE → VENTA
    ↓             ↓                                        ↓            ↓
[creado]    [disponible]                           [online_ready]   [vendido]
              ↓                                                         ↓
         [venta física]                                          [stock = 0]
```

## 🔍 Verificación de Stock

El sistema verifica disponibilidad en múltiples puntos:

1. **Venta Física (POS):**
   - Consulta `inventario.quantity` antes de vender
   - Reduce stock al confirmar venta

2. **Preparación Online:**
   - Solo muestra productos con `quantity > 0`
   - No afecta el stock

3. **Venta Online:**
   - Verifica stock antes de procesar pago (línea 112-134 en onlinePayment.controller.ts)
   - Reduce stock al confirmar pago aprobado (línea 257-261)

## 🗄️ Resumen de Tablas Principales

| Tabla | Propósito | Campos Clave |
|-------|-----------|--------------|
| `valuation_items` | Productos valuados | id, online_store_ready, weight_grams, online_price, images |
| `inventario` | Control de stock | id (SKU), valuation_item_id, quantity, location |
| `sales` | Ventas físicas | id, total_amount, payment_method, status |
| `sale_items` | Detalle ventas físicas | sale_id, inventario_id, quantity_sold |
| `online_sales` | Ventas online | id, payment_id, customer_email, payment_status |
| `online_sale_items` | Detalle ventas online | online_sale_id, valuation_item_id, quantity |

## 🔐 Seguridad y Roles

- **Valuación:** valuator, admin, manager
- **Venta Física:** sales, vendedor, admin, manager
- **Preparación Online:** sales, vendedor, admin, manager
- **Tienda Online:** Público (sin autenticación requerida)
- **Procesamiento de Pagos:** Sistema automático con MercadoPago

## 🚀 Flujo de Datos Completo

```
1. Cliente lleva productos → Valuador los registra
2. Sistema crea: valuation_items + inventario (stock inicial)
3. Producto disponible en POS inmediatamente
4. Staff prepara para online (peso + fotos + precio)
5. Producto visible en tienda online
6. Cliente compra online → MercadoPago procesa
7. Sistema actualiza: online_sales + reduce inventario
8. Stock = 0 → Producto no disponible
```