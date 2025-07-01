# Módulo de Ventas - Documentación Detallada

## Información General

**Módulo:** Sistema de Ventas (Physical Store Sales)  
**Versión:** 1.0  
**Fecha de Implementación:** Junio 2025  
**Estado:** ✅ COMPLETADO  

## Descripción

El módulo de ventas permite gestionar las operaciones de venta en la tienda física de Entrepeques, incluyendo:
- Búsqueda y selección de productos del inventario
- Gestión de clientes (registrados y ocasionales)
- Procesamiento de pagos (simples y mixtos)
- Historial y seguimiento de ventas
- Generación de reportes y estadísticas

## Arquitectura del Sistema

### Base de Datos

#### Tablas Principales

**1. sales**
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    client_name VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES users(id),
    sale_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    location VARCHAR(100) DEFAULT 'Polanco',
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

**2. sale_items**
```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
    quantity_sold INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

**3. payment_details**
```sql
CREATE TABLE payment_details (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

**4. inventario**
```sql
CREATE TABLE inventario (
    id VARCHAR(50) PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(100) DEFAULT 'Polanco',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

#### Relaciones Clave

- `sales.client_id → clients.id` (opcional para clientes registrados)
- `sales.user_id → users.id` (usuario que realizó la venta)
- `sale_items.sale_id → sales.id` (items de cada venta)
- `sale_items.inventario_id → inventario.id` (productos vendidos)
- `payment_details.sale_id → sales.id` (detalles de pago)

### Backend API

#### Estructura de Archivos

```
packages/api/src/
├── controllers/sales.controller.ts
├── services/sales.service.ts
├── models/sales.model.ts
├── routes/sales.routes.ts
└── migrations/
    ├── 008-add-location-and-inventario.sql
    ├── 009-create-sales-tables.sql
    └── 010-add-payment-details.sql
```

#### Endpoints Principales

**POST /api/sales**
- Crear nueva venta
- Soporta pagos simples y mixtos
- Validación de stock y totales
- Transacciones ACID

**GET /api/sales**
- Lista de ventas con filtros
- Paginación
- Búsqueda por cliente, fecha, método de pago

**GET /api/sales/:id**
- Detalle completo de venta
- Incluye items y payment_details

**GET /api/inventory/search**
- Búsqueda de productos en inventario
- Filtros por categoría, ubicación, disponibilidad

**GET /api/inventory/available**
- Productos disponibles (stock > 0)
- Optimizado para proceso de venta

#### Lógica de Negocio

**Proceso de Venta:**
1. Validación de stock para todos los items
2. Validación de información del cliente
3. Cálculo y validación de totales de pago
4. Creación de venta en transacción
5. Creación de payment_details
6. Creación de sale_items
7. Actualización de inventario (reducción de stock)
8. Confirmación de transacción

**Validaciones:**
- Stock suficiente para cada producto
- Suma de payment_details = total_amount
- Al menos un método de pago > 0 para pagos mixtos
- Cliente válido (registrado o nombre para ocasional)

### Frontend

#### Estructura de Componentes

```
apps/valuador/src/components/
├── NuevaVenta.jsx          # Flujo de nueva venta
├── HistorialVentas.jsx     # Lista y estadísticas
└── VentasApp.jsx          # Contenedor principal
```

#### Flujo de Usuario (NuevaVenta.jsx)

**Paso 1: Selección de Productos**
- Búsqueda en tiempo real con debounce (300ms)
- Vista de productos disponibles con stock
- Carrito de compras con validación de cantidades
- Precios no editables (fijos del sistema de valuación)

**Paso 2: Información del Cliente**
- Selección entre cliente registrado u ocasional
- Búsqueda de clientes registrados con debounce
- Validación de campos requeridos

**Paso 3: Método de Pago**
- Selección entre: Efectivo, Tarjeta, Transferencia, Mixto
- Para pagos mixtos: campos individuales por método
- Validación en tiempo real de totales
- Botón deshabilitado si totales no coinciden

**Paso 4: Confirmación**
- Resumen completo de la venta
- Desglose de pagos mixtos
- Opciones de impresión y nueva venta

#### Características del Frontend

**Gestión de Estado:**
```javascript
const [paymentData, setPaymentData] = useState({
    payment_method: 'efectivo',
    notes: '',
    mixedPayments: {
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0
    }
});
```

**Validaciones en Tiempo Real:**
- Validación de stock disponible
- Cálculo automático de totales
- Verificación de pagos mixtos
- Feedback visual con colores

**Historial y Estadísticas:**
- Filtros por fecha, cliente, método de pago
- Estadísticas en tiempo real (hoy, semana, promedio)
- Modal de detalle con información completa
- Soporte para pagos mixtos en visualización

## Sistema de Pagos Mixtos

### Concepto

Los pagos mixtos permiten dividir el total de una venta entre múltiples métodos de pago:

**Ejemplo:**
- Total venta: $800
- Efectivo: $500
- Tarjeta: $300
- Total pagos: $800 ✅

### Métodos de Pago Soportados

1. **Efectivo** - Pago en efectivo tradicional
2. **Tarjeta** - Tarjetas de crédito/débito
3. **Transferencia** - Transferencias bancarias
4. **Crédito en Tienda** - Uso del crédito acumulado del cliente
5. **Mixto** - Combinación de cualquiera de los anteriores

### Implementación

**Base de Datos:**
- `sales.payment_method = 'mixto'`
- Múltiples registros en `payment_details` para la misma venta

**Frontend:**
- Campos individuales para cada método
- Validación de suma exacta
- Feedback visual en tiempo real

**Backend:**
- Validación que suma = total_amount
- Transacciones atómicas
- Compatibilidad hacia atrás con pagos simples
- Validación de crédito disponible para método `credito_tienda`
- Actualización automática del saldo de crédito después de venta

## Sistema de Crédito en Tienda

### Concepto

El crédito en tienda permite a los clientes acumular saldo a favor que pueden usar en futuras compras. Este crédito se genera principalmente cuando un proveedor elige recibir su pago en crédito de tienda durante el proceso de valuación.

### Implementación

**Base de Datos:**
- Campo `store_credit` en tabla `clients` (NUMERIC 10,2)
- Índice para búsquedas eficientes de clientes con crédito
- Valor por defecto: 0.00

**Reglas de Negocio:**
- Solo clientes registrados pueden usar crédito
- No hay límite mínimo para usar crédito
- Límite máximo: el crédito disponible del cliente
- El crédito puede combinarse con otros métodos de pago
- No requiere autorización especial para su uso

**Proceso de Uso:**
1. Al seleccionar un cliente registrado, se muestra su crédito disponible
2. Si tiene crédito, aparece "Crédito en Tienda" como opción de pago
3. Si el total excede el crédito, se sugiere automáticamente pago mixto
4. Al confirmar la venta, se descuenta el crédito usado del saldo del cliente

**Validaciones:**
- Frontend: Previene usar más crédito del disponible
- Backend: Doble validación antes de procesar la venta
- Transacción atómica: Si falla algo, no se descuenta el crédito

**Visualización:**
- Crédito disponible se muestra en verde en la selección de cliente
- Tarjeta dedicada muestra el crédito al seleccionar método de pago
- Advertencia clara si no hay cliente registrado seleccionado

## Manejo de Inventario

### Generación de IDs

Los productos se almacenan en `inventario` con IDs generados automáticamente:

**Formato:** `{SKU_SUBCATEGORIA}{NUMERO_SECUENCIAL}`
**Ejemplo:** `ROD001`, `ZAP002`, `CAS003`

### Proceso de Actualización

1. **Valuación completada** → Producto agregado a inventario
2. **Venta procesada** → Stock reducido automáticamente
3. **Stock = 0** → Producto no aparece en búsquedas disponibles

### Búsqueda y Filtros

- Búsqueda por ID, categoría, marca
- Filtro por ubicación (Polanco por defecto)
- Solo productos con stock > 0 en ventas
- Información completa del producto (categoría, marca, precio)

## Problemas Resueltos y Lecciones Aprendidas

### 1. Conversión de Tipos de Datos PostgreSQL

**Problema:** Los valores numéricos de PostgreSQL llegan como strings al frontend, causando `$NaN` en cálculos.

**Solución:**
```typescript
// En sales.service.ts
total_amount: parseFloat(row.total_amount),
unit_price: parseFloat(item.unit_price),
quantity: parseInt(row.quantity),
```

**Lección:** Siempre convertir explícitamente tipos numéricos del backend.

### 2. Autenticación en Servicios

**Problema:** Errores de autenticación intermitentes por tokens no actualizados.

**Solución:**
```typescript
private ensureAuthenticated(): void {
    this.initializeIfBrowser();
    this.refreshAuthToken();
    
    const token = this.authService.getToken();
    if (!token) {
        throw new Error('No está autenticado');
    }
}
```

**Lección:** Verificar y actualizar tokens antes de cada llamada API.

### 3. Parámetros SQL Indexados

**Problema:** Error "could not determine data type of parameter" por incremento incorrecto de índices.

**Solución:**
```typescript
// Correcto:
query += ` AND (field1 LIKE $${paramIndex++} OR field2 ILIKE $${paramIndex++})`;
queryParams.push(searchTerm, searchTerm);
// No incrementar paramIndex adicional después de push()
```

**Lección:** Cuidar el conteo de parámetros en consultas SQL complejas.

### 4. Compatibilidad hacia Atrás

**Problema:** Migrar de `payment_method` simple a `payment_details` sin romper funcionalidad existente.

**Solución:**
- Mantener ambos campos
- Controller convierte automáticamente formato legacy
- Frontend envía nuevo formato pero backend acepta ambos

**Lección:** Implementar migraciones graduales con compatibilidad hacia atrás.

### 5. Validación de Pagos Mixtos

**Problema:** Permitir diferencias mínimas por redondeo en cálculos de decimales.

**Solución:**
```typescript
const isValid = Math.abs(totalAmount - paymentsTotal) < 0.01; // Tolerancia 1 centavo
```

**Lección:** Usar tolerancias en comparaciones de punto flotante.

## Flujo Completo de Venta

### Diagrama de Flujo

```
1. Usuario busca productos
   ↓
2. Agrega productos al carrito
   ↓
3. Selecciona tipo de cliente
   ↓
4. Elige método de pago
   ↓ (si es mixto)
5. Distribuye cantidades por método
   ↓
6. Valida totales
   ↓
7. Procesa venta (transacción)
   ↓
8. Actualiza inventario
   ↓
9. Confirma y muestra resumen
```

### Validaciones por Paso

**Paso 1:**
- Productos existen en inventario
- Stock suficiente disponible

**Paso 2:**
- Carrito no vacío
- Cantidades válidas por producto

**Paso 3:**
- Cliente ocasional: nombre requerido
- Cliente registrado: selección requerida

**Paso 4:**
- Pago simple: método válido
- Pago mixto: al menos un método > 0, suma exacta

**Transacción:**
- Stock suficiente (revalidación)
- Cliente válido
- Totales correctos
- Integridad referencial

## Métricas y Monitoreo

### Estadísticas Calculadas

**En Tiempo Real:**
- Ventas de hoy (cantidad y monto)
- Ventas de la semana (cantidad y monto)
- Promedio por venta (basado en ventas de hoy)
- Total de ventas registradas

**Filtros Disponibles:**
- Por fecha (rango)
- Por cliente (ID o nombre)
- Por método de pago
- Por estado (completada, cancelada, reembolsada)
- Por ubicación

### Información de Auditoría

**Cada venta registra:**
- Usuario que procesó la venta
- Fecha y hora exacta
- IP del cliente (implícito)
- Detalles completos de productos vendidos
- Métodos de pago utilizados

## Extensibilidad Futura

### Funcionalidades Preparadas

1. **Múltiples Ubicaciones:** Campo `location` en todas las tablas
2. **Estados de Venta:** Soporte para cancelaciones y reembolsos
3. **Notas Detalladas:** Campos de notas en ventas y items
4. **Clientes Flexibles:** Soporte para registrados y ocasionales
5. **Auditoría Completa:** Timestamps y referencias de usuario

### Integraciones Futuras

1. **Sistema POS:** Endpoints listos para interfaz de punto de venta
2. **Reportes Avanzados:** Base de datos optimizada para analytics
3. **Inventario Multiubicación:** Estructura preparada
4. **Facturación:** Campos preparados para datos fiscales
5. **Promociones:** Estructura flexible para descuentos futuros

## Testing y Validación

### Casos de Prueba Cubiertos

1. **Venta Simple:** Efectivo, un producto, cliente ocasional
2. **Venta Mixta:** Múltiples métodos, múltiples productos
3. **Stock Insuficiente:** Validación de disponibilidad
4. **Clientes Registrados:** Búsqueda y selección
5. **Totales Incorrectos:** Validación de pagos mixtos
6. **Transacciones Fallidas:** Rollback automático

### Validaciones de Seguridad

1. **Autenticación:** JWT requerido en todos los endpoints
2. **Autorización:** Solo usuarios con rol apropiado
3. **Validación de Entrada:** Sanitización de datos
4. **Integridad Referencial:** Constraints en base de datos
5. **Transacciones ACID:** Consistencia garantizada

## Configuración y Deployment

### Variables de Entorno

```bash
# Backend
JWT_SECRET=secret_key
DATABASE_URL=postgresql://user:pass@db:5432/entrepeques_dev

# Frontend
PUBLIC_API_URL=http://localhost:3001/api
```

### Comandos de Setup

```bash
# Migrar base de datos
npm run migrate

# Iniciar servicios
docker-compose up -d

# Cargar datos de prueba (opcional)
npm run seed:sales
```

## Conclusiones

El módulo de ventas implementa un sistema completo y robusto para gestionar las operaciones de la tienda física, con las siguientes características destacadas:

1. **Flexibilidad:** Soporta múltiples tipos de pago y clientes
2. **Robustez:** Transacciones ACID y validaciones completas
3. **Usabilidad:** Interfaz intuitiva con validación en tiempo real
4. **Escalabilidad:** Preparado para múltiples ubicaciones y funcionalidades futuras
5. **Mantenibilidad:** Código bien estructurado y documentado

La implementación siguió las mejores prácticas de desarrollo y resolvió efectivamente los desafíos técnicos encontrados, estableciendo un foundation sólido para futuras expansiones del sistema.