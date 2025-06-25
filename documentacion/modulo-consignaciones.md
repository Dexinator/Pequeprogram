# Módulo de Consignaciones

## Descripción General

El módulo de consignaciones permite gestionar productos que los proveedores dejan en la tienda bajo un modelo de consignación, donde el proveedor solo recibe pago cuando el producto se vende. El sistema maneja tres estados principales: disponible, vendido sin pagar, y vendido pagado.

## Modelo de Negocio

En el modelo de consignación:
- Los proveedores dejan sus productos en la tienda
- Los productos permanecen en inventario hasta venderse
- El proveedor solo recibe pago cuando el producto se vende
- La tienda puede gestionar cuándo pagar a cada proveedor

## Arquitectura del Sistema

### Base de Datos

#### Tabla Principal: `valuation_items`
Los productos en consignación se almacenan en la tabla `valuation_items` con:
- `modality = 'consignación'` (con acento)
- Campos de pago agregados en migración 011:
  - `consignment_paid`: BOOLEAN DEFAULT FALSE
  - `consignment_paid_date`: TIMESTAMP WITHOUT TIME ZONE
  - `consignment_paid_amount`: NUMERIC(10,2)
  - `consignment_paid_notes`: TEXT

#### Relaciones Clave
```sql
-- Productos en consignación (ACTUALIZADO con valuation_item_id)
valuation_items (modality = 'consignación')
├── JOIN valuations ON valuation_id
├── JOIN clients ON client_id
├── JOIN categories/subcategories/brands
├── LEFT JOIN inventario ON inventario.valuation_item_id = valuation_items.id
└── LEFT JOIN sale_items ON sale_items.inventario_id = inventario.id
    └── LEFT JOIN sales ON sale_id
```

### Estados del Sistema

#### 1. **available** (Disponible)
- Producto en tienda, no vendido
- Condición: `sale_items.id IS NULL`

#### 2. **sold_unpaid** (Vendido - Sin Pagar)
- Producto vendido pero proveedor no pagado
- Condición: `sale_items.id IS NOT NULL AND valuation_items.consignment_paid = FALSE`

#### 3. **sold_paid** (Vendido - Pagado)
- Producto vendido y proveedor pagado
- Condición: `sale_items.id IS NOT NULL AND valuation_items.consignment_paid = TRUE`

### API Endpoints

#### `GET /api/consignments`
Lista productos en consignación con filtros:
- **Filtros**: status, location, client_id, pagination
- **Respuesta**: Array de productos con información completa
- **Autorización**: admin, manager, valuator, sales

#### `GET /api/consignments/:id`
Obtiene detalles de un producto específico:
- **Respuesta**: Producto completo con información de cliente, venta y pago
- **Autorización**: admin, manager, valuator, sales

#### `GET /api/consignments/stats`
Estadísticas del sistema de consignaciones:
- **Métricas**:
  - `total_items`: Total de productos en consignación
  - `available_items`: Productos disponibles en tienda
  - `sold_unpaid_items`: Productos vendidos pendientes de pago
  - `sold_paid_items`: Productos vendidos ya pagados
  - `total_available_value`: Valor total disponible
  - `total_unpaid_value`: Valor pendiente de pago
  - `total_paid_value`: Valor total pagado
  - `total_sold_value`: Valor total de ventas
- **Autorización**: admin, manager, valuator, sales

#### `PUT /api/consignments/:id/paid`
Marca un producto como pagado al proveedor:
- **Body**: `{ paid_amount: number, notes?: string }`
- **Validación**: Solo productos en estado `sold_unpaid`
- **Autorización**: admin, manager (solo roles con permisos de pago)

## Frontend - Interfaz de Usuario

### Página Principal (`/consignaciones`)
- **Archivo**: `apps/valuador/src/pages/consignaciones.astro`
- **Componente**: `ConsignmentsList.jsx`

### Características de la Interfaz

#### Panel de Estadísticas
6 tarjetas con métricas en tiempo real:
1. **Total Productos**: Cantidad total en consignación
2. **Disponibles**: Productos en tienda no vendidos
3. **Vendidos Sin Pagar**: Productos vendidos pendientes de pago
4. **Vendidos Pagados**: Productos completamente procesados
5. **Pendiente de Pago**: Valor monetario pendiente
6. **Total Pagado**: Valor total ya pagado a proveedores

#### Sistema de Filtros
- **Estado**: Todos, Disponibles, Vendidos Sin Pagar, Vendidos Pagados, Todos los Vendidos
- **Ubicación**: Polanco, Satélite, Roma
- **ID Cliente**: Búsqueda por cliente específico
- **Paginación**: 10, 20, 50 registros por página

#### Tabla de Productos
Columnas principales:
- ID del producto
- Descripción (generada dinámicamente)
- Información del cliente
- Precio de consignación
- Precio de venta
- Ubicación
- Estado (badge visual)
- Acciones contextuales

#### Modales de Interacción

##### Modal de Detalle
- Información completa del producto
- Datos del cliente y valuación
- Precios detallados
- Características específicas
- Información de venta (si aplica)
- Información de pago (si aplica)
- Notas adicionales

##### Modal de Pago
- Confirmación de datos del producto
- Campo para monto pagado
- Campo para notas del pago
- Validación de datos requeridos

## Servicios Frontend

### `ConsignmentService`
- **Archivo**: `apps/valuador/src/services/consignment.service.ts`
- **Patrón**: Utiliza `HttpService` y `AuthService` establecidos
- **Métodos**:
  - `getConsignments(filters)`: Lista con filtros
  - `getConsignment(id)`: Detalle específico
  - `markAsPaid(id, amount, notes)`: Marcar como pagado
  - `getStats()`: Estadísticas del sistema
  - `formatCurrency(amount)`: Formateo de moneda
  - `formatDate(date)`: Formateo de fechas
  - `getProductDescription(product)`: Descripción dinámica

### Utilerías de Formato

#### Descripción de Productos
Genera descripciones dinámicas basadas en:
1. Subcategoría
2. Características importantes (talla, color, modelo, tipo)
3. Marca (si no es "Sin marca")

Ejemplo: `Playera - Talla M - Rojo - Nike`

#### Formateo de Moneda
- Formato: Peso mexicano (es-MX)
- Validación: Manejo de valores nulos/indefinidos
- Ejemplo: `$1,234.56`

## Flujo de Trabajo Completo

### 1. Registro de Consignación
```
Valuación → Modalidad "Consignación" → Estado: available
```

### 2. Venta de Producto
```
Venta (sale_items) → Estado: sold_unpaid
```

### 3. Pago a Proveedor
```
PUT /consignments/:id/paid → Estado: sold_paid
```

## Consultas SQL Importantes

### Estado de Consignaciones (ACTUALIZADO)
```sql
SELECT 
  vi.id,
  CASE 
    WHEN si.id IS NULL THEN 'available'
    WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 'sold_unpaid'
    WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN 'sold_paid'
  END as status
FROM valuation_items vi
LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
LEFT JOIN sale_items si ON si.inventario_id = inv.id
WHERE vi.modality = 'consignación'
```

### Estadísticas Completas (ACTUALIZADO)
```sql
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN si.id IS NULL THEN 1 END) as available_items,
  COUNT(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 1 END) as sold_unpaid_items,
  COUNT(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN 1 END) as sold_paid_items,
  SUM(CASE WHEN si.id IS NULL THEN vi.consignment_price ELSE 0 END) as total_available_value,
  SUM(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN vi.consignment_price ELSE 0 END) as total_unpaid_value,
  SUM(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN vi.consignment_paid_amount ELSE 0 END) as total_paid_value
FROM valuation_items vi
LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
LEFT JOIN sale_items si ON si.inventario_id = inv.id
WHERE vi.modality = 'consignación'
```

## Seguridad y Permisos

### Niveles de Acceso
- **Consulta**: admin, manager, valuator, sales
- **Pago**: admin, manager (solo roles administrativos)

### Validaciones
- Token JWT requerido para todas las operaciones
- Verificación de estado antes de marcar como pagado
- Validación de montos positivos en pagos
- Transacciones de base de datos para consistencia

## Archivos del Sistema

### Backend
- `packages/api/src/controllers/consignment.controller.ts`
- `packages/api/src/services/consignment.service.ts`
- `packages/api/src/routes/consignment.routes.ts`
- `packages/api/src/migrations/011-add-consignment-payment-fields.sql`
- `packages/api/src/migrations/012-add-valuation-item-id-to-inventario.sql` (Nueva relación mejorada)

### Frontend
- `apps/valuador/src/pages/consignaciones.astro`
- `apps/valuador/src/components/ConsignmentsList.jsx`
- `apps/valuador/src/services/consignment.service.ts`

### Documentación
- `documentacion/modulo-consignaciones.md` (este archivo)
- `documentacion/errores-comunes.md` (errores registrados)

## Testing y Verificación

### Comandos de Verificación
```bash
# Verificar productos en consignación
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "SELECT modality, COUNT(*) FROM valuation_items GROUP BY modality"

# Verificar estados
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "SELECT vi.id, CASE WHEN si.id IS NULL THEN 'available' WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 'sold_unpaid' ELSE 'sold_paid' END as status FROM valuation_items vi LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR) WHERE vi.modality = 'consignación'"

# Verificar campos de pago
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "\d valuation_items" | grep consignment
```

### Endpoints de Testing
```bash
# Estadísticas
GET /api/consignments/stats

# Lista con filtros
GET /api/consignments?status=available&limit=10

# Marcar como pagado
PUT /api/consignments/:id/paid
Body: {"paid_amount": 75.60, "notes": "Pago efectivo"}
```

## Mejoras Recientes de la Arquitectura

### Migración 012: Relación Inventario-Valuaciones Mejorada

#### Problema Anterior
- Las consignaciones se relacionaban usando `CAST(vi.id AS VARCHAR)` para vincular `valuation_items` con `sale_items.inventario_id`
- Esta relación era frágil, dependía de conversión de tipos y no era escalable
- No había trazabilidad completa para todos los productos del inventario

#### Solución Implementada
- **Nueva columna**: `inventario.valuation_item_id INTEGER` con foreign key a `valuation_items.id`
- **Relación directa**: `inventario.valuation_item_id = valuation_items.id`
- **Índice optimizado**: `idx_inventario_valuation_item_id` para consultas rápidas
- **Migración de datos**: Productos existentes migrados automáticamente
- **Trazabilidad completa**: TODOS los productos del inventario ahora se relacionan con su valuación original

#### Nueva Estructura de Consultas
```sql
-- ANTES (frágil)
LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR)

-- AHORA (robusto)
LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
LEFT JOIN sale_items si ON si.inventario_id = inv.id
```

#### Beneficios
1. **Integridad referencial**: Foreign key garantiza consistencia
2. **Performance mejorada**: JOIN directo más eficiente que CAST
3. **Escalabilidad**: Soporta cualquier volumen de productos
4. **Trazabilidad**: Seguimiento completo desde valuación hasta venta
5. **Mantenibilidad**: Relaciones claras y explícitas en el esquema

## Notas de Implementación

### Decisiones Técnicas
1. **Almacenamiento**: Se eligió agregar campos a `valuation_items` en lugar de crear una tabla separada para simplificar consultas
2. **Estados**: Sistema de tres estados manejado por lógica de consulta, no por campo enum
3. **Relación mejorada**: Se agregó `valuation_item_id` a la tabla `inventario` para establecer una relación directa y confiable entre inventario y valuaciones (reemplaza el anterior `CAST(vi.id AS VARCHAR)`)
4. **Acento**: Importante usar `'consignación'` (con acento) en todas las consultas
5. **Trazabilidad completa**: Todos los productos del inventario ahora tienen `valuation_item_id` para trazabilidad completa desde la valuación hasta la venta

### Consideraciones de Performance
- Índices existentes en `valuation_items` optimizan consultas principales
- Nuevo índice en `inventario.valuation_item_id` optimiza JOINs
- LEFT JOINs permiten consultas eficientes de estado
- Paginación implementada para listas grandes
- Estadísticas calculadas en tiempo real (considerar caché futuro)
- Relación directa `inventario.valuation_item_id` mejora performance vs. CAST anterior

## Próximas Mejoras

### Funcionalidades Potenciales
1. **Reportes**: Reportes de pagos por período
2. **Notificaciones**: Alertas de productos vendidos pendientes de pago
3. **Exportación**: Exportar listados a Excel/PDF
4. **Historial**: Registro de cambios de estado
5. **Comisiones**: Cálculo automático de comisiones de tienda

### Optimizaciones
1. **Caché**: Implementar caché para estadísticas
2. **Índices**: Índices adicionales si el volumen crece
3. **Archivado**: Sistema de archivado para productos antiguos
4. **Batch**: Operaciones en lote para pagos múltiples