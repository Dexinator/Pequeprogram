# Errores Comunes y Soluciones

Este documento registra errores comunes encontrados durante el desarrollo y sus soluciones para evitar que se repitan.

## Error: Cannot find module '../utils/jwt'

### Fecha: 19 de Junio, 2025
### Contexto: Creación del módulo de consignaciones

### Descripción del Error:
```
Error: Cannot find module '../utils/jwt'
Require stack:
- /app/src/routes/consignment.routes.ts
- /app/src/routes/index.ts
- /app/src/index.ts
```

### Causa Raíz:
Se intentó importar el middleware de autenticación JWT usando una ruta incorrecta:
```typescript
import { authenticateToken } from '../utils/jwt';
```

### Solución:
El proyecto utiliza un sistema de middleware de autenticación diferente ubicado en `../utils/auth.middleware`. La importación correcta es:

```typescript
import { protect, authorize } from '../utils/auth.middleware';
```

### Ejemplo de Implementación Correcta:
```typescript
import { Router } from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import { getAllConsignments, getConsignmentById, markConsignmentAsSold, getConsignmentStats } from '../controllers/consignment.controller';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// GET /api/consignments/stats - Obtener estadísticas de consignaciones
router.get('/stats', authorize(['admin', 'manager', 'valuator', 'sales']), getConsignmentStats);

// GET /api/consignments - Obtener todos los productos en consignación
router.get('/', authorize(['admin', 'manager', 'valuator', 'sales']), getAllConsignments);

// GET /api/consignments/:id - Obtener un producto en consignación específico
router.get('/:id', authorize(['admin', 'manager', 'valuator', 'sales']), getConsignmentById);

// PUT /api/consignments/:id/sold - Marcar producto como vendido
router.put('/:id/sold', authorize(['admin', 'manager', 'sales']), markConsignmentAsSold);

export default router;
```

### Prevención:
1. **Siempre revisar rutas existentes** antes de crear nuevas. Usar como referencia:
   - `packages/api/src/routes/sales.routes.ts`
   - `packages/api/src/routes/auth.routes.ts`
   - `packages/api/src/routes/category.routes.ts`

2. **Estructura de autenticación del proyecto**:
   - **`protect`**: Middleware básico de autenticación JWT
   - **`authorize(['roles'])`**: Middleware de autorización por roles
   - **Roles disponibles**: `admin`, `manager`, `valuator`, `sales`

3. **Comando para buscar patrones existentes**:
   ```bash
   grep -r "protect\|authorize" packages/api/src/routes/
   ```

### Archivos de Referencia:
- `packages/api/src/utils/auth.middleware.ts` - Middleware de autenticación
- `packages/api/src/utils/jwt.util.ts` - Utilidades JWT
- `packages/api/src/routes/sales.routes.ts` - Ejemplo de implementación correcta

### Nota:
Este error es común al copiar patrones de otros proyectos sin verificar la estructura específica del proyecto actual. Siempre verificar las convenciones de naming y estructura del proyecto antes de implementar nuevas funcionalidades.

---

## Error: Authorization Bearer null

### Fecha: 19 de Junio, 2025
### Contexto: Implementación del servicio de consignaciones

### Descripción del Error:
```
authorization: 'Bearer null'
🛡️ Token extraído: null...
❌ Error verificando token JWT: JsonWebTokenError: jwt malformed
```

### Causa Raíz:
El servicio de consignaciones no estaba usando el patrón de autenticación establecido en el proyecto. Se intentó crear un método `getAuthHeaders()` personalizado que accedía directamente a `localStorage.getItem('token')`, pero el proyecto usa un sistema centralizado con `HttpService` y `AuthService`.

### Solución:
Usar el patrón establecido en el proyecto con `HttpService` y `AuthService`:

```typescript
import { HttpService } from './http.service';
import { AuthService } from './auth.service';

class ConsignmentService {
  private http: HttpService;
  private authService: AuthService;
  private baseUrl = '/consignments';

  constructor() {
    this.http = new HttpService();
    this.authService = new AuthService();
    this.initializeIfBrowser();
  }

  private initializeIfBrowser() {
    if (typeof window !== 'undefined') {
      this.refreshAuthToken();
    }
  }

  private refreshAuthToken() {
    const token = this.authService.getToken();
    if (token) {
      this.http.setAuthToken(token);
    }
  }

  private ensureAuthenticated() {
    this.initializeIfBrowser();
    this.refreshAuthToken();
    
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No está autenticado. Por favor inicie sesión.');
    }
  }

  async getConsignments(filters: ConsignmentFilters = {}) {
    this.ensureAuthenticated();
    const response = await this.http.get<{ data: ConsignmentProduct[] }>(this.baseUrl, params);
    return response.data;
  }
}
```

### Prevención:
1. **Siempre usar los servicios existentes** para autenticación:
   - `HttpService` para comunicación HTTP
   - `AuthService` para manejo de tokens y autenticación

2. **Patrón estándar para servicios**:
   - Inyectar `HttpService` y `AuthService` en el constructor
   - Llamar `ensureAuthenticated()` antes de cada petición
   - Usar `this.http.get/post/put/delete()` en lugar de `fetch()` directo

3. **Archivos de referencia**:
   - `apps/valuador/src/services/sales.service.ts` - Ejemplo completo
   - `apps/valuador/src/services/http.service.ts` - Servicio HTTP base
   - `apps/valuador/src/services/auth.service.ts` - Servicio de autenticación

### Comandos de verificación:
```bash
# Buscar servicios que usan el patrón correcto
grep -r "ensureAuthenticated\|HttpService\|AuthService" apps/valuador/src/services/

# Verificar que no se use fetch directo en servicios
grep -r "fetch(" apps/valuador/src/services/
```

---

## Error: Productos en Consignación No Aparecen

### Fecha: 19 de Junio, 2025
### Contexto: Consulta de datos de consignación desde la base de datos

### Descripción del Error:
La página de consignaciones se carga pero no muestra ningún producto, a pesar de que existen productos en la base de datos.

### Causa Raíz:
1. **Error de codificación de caracteres**: Se buscaba `'consignacion'` pero en la base de datos está almacenado como `'consignación'` (con acento)
2. **Estructura de datos incorrecta**: Los productos en consignación están en `valuation_items` pero no necesariamente tienen registros en `inventario`
3. **Lógica de estado incorrecta**: El estado vendido/disponible se determina por la presencia de registros en `sale_items`, no por campos de estado

### Solución:
Corregir las consultas SQL para reflejar la estructura real:

```sql
-- Búsqueda correcta con acento
WHERE vi.modality = 'consignación'

-- Estado basado en sale_items
CASE 
  WHEN si.id IS NULL THEN 'available'
  WHEN si.id IS NOT NULL THEN 'sold'
END as status

-- Relación correcta valuation_items -> sale_items
LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR)
```

### Estructura de Datos Correcta:
- **valuation_items**: Contiene productos valuados con `modality = 'consignación'`
- **inventario**: NO es requerido para productos en consignación
- **sale_items**: Se crea cuando el producto se vende, referencia `inventario_id = CAST(valuation_items.id AS VARCHAR)`
- **Estado**: `available` si no hay registro en sale_items, `sold` si existe

### Consulta Corregida:
```sql
SELECT 
  vi.id,
  vi.valuation_id,
  c.name as client_name,
  cat.name as category_name,
  sub.name as subcategory_name,
  vi.consignment_price,
  vi.final_sale_price,
  CASE 
    WHEN si.id IS NULL THEN 'available'
    ELSE 'sold'
  END as status,
  s.sale_date as sold_date
FROM valuation_items vi
JOIN valuations v ON vi.valuation_id = v.id
JOIN clients c ON v.client_id = c.id
JOIN categories cat ON vi.category_id = cat.id
JOIN subcategories sub ON vi.subcategory_id = sub.id
LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR)
LEFT JOIN sales s ON si.sale_id = s.id
WHERE vi.modality = 'consignación'
ORDER BY vi.created_at DESC
```

### Comandos de Verificación:
```bash
# Verificar productos en consignación
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "SELECT modality, COUNT(*) FROM valuation_items GROUP BY modality"

# Verificar relación con ventas
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "SELECT vi.id, vi.modality, si.id as sale_item_id FROM valuation_items vi LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR) WHERE vi.modality = 'consignación'"
```

### Prevención:
1. **Verificar datos reales** antes de escribir consultas
2. **Usar acentos correctos** según los datos almacenados
3. **Entender la relación entre tablas** en el contexto específico del negocio
4. **Probar consultas SQL directamente** antes de implementar en código

---

## Mejora Implementada: Sistema de Pagos de Consignación

### Fecha: 19 de Junio, 2025
### Contexto: Gestión de pagos a proveedores por productos vendidos en consignación

### Problema Identificado:
El sistema original solo distinguía entre productos "disponibles" y "vendidos", pero no había forma de registrar cuándo se había pagado al proveedor por un producto vendido en consignación.

### Solución Implementada:

#### **1. Migración de Base de Datos (011-add-consignment-payment-fields.sql)**
```sql
ALTER TABLE valuation_items 
ADD COLUMN consignment_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN consignment_paid_date TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN consignment_paid_amount NUMERIC(10,2),
ADD COLUMN consignment_paid_notes TEXT;
```

#### **2. Estados de Consignación Actualizados**
- **available**: En tienda, no vendido
- **sold_unpaid**: Vendido pero pendiente de pago al proveedor  
- **sold_paid**: Vendido y pagado al proveedor

#### **3. API Endpoints Nuevos**
```
PUT /api/consignments/:id/paid
Body: { paid_amount: number, notes?: string }
```

#### **4. Estadísticas Mejoradas**
- `sold_unpaid_items`: Productos vendidos pendientes de pago
- `sold_paid_items`: Productos vendidos ya pagados
- `total_unpaid_value`: Valor total pendiente de pago
- `total_paid_value`: Valor total ya pagado

### Lógica de Estados:
```sql
CASE 
  WHEN si.id IS NULL THEN 'available'
  WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 'sold_unpaid'
  WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN 'sold_paid'
END as status
```

### Archivos Modificados:
- **Backend**: `consignment.service.ts`, `consignment.controller.ts`, `consignment.routes.ts`
- **Frontend**: `consignment.service.ts` (interfaces actualizadas)
- **Database**: Nueva migración 011

### Flujo de Trabajo:
1. Producto se valúa con modalidad "consignación" → **available**
2. Producto se vende (registro en sale_items) → **sold_unpaid**  
3. Se paga al proveedor (PUT /consignments/:id/paid) → **sold_paid**

### Comandos de Verificación:
```bash
# Verificar nuevos campos
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "\d valuation_items" | grep consignment

# Probar lógica de estados
docker exec entrepeques-db-dev psql -U user -d entrepeques_dev -c "SELECT vi.id, CASE WHEN si.id IS NULL THEN 'available' WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 'sold_unpaid' ELSE 'sold_paid' END as status FROM valuation_items vi LEFT JOIN sale_items si ON si.inventario_id = CAST(vi.id AS VARCHAR) WHERE vi.modality = 'consignación'"
```