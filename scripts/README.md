# Scripts de Migración - WooCommerce a Entrepeques

## Descripción

Estos scripts migran ~600 productos del sistema anterior de WooCommerce al nuevo sistema Entrepeques.

## Características

### Script de Productos (`migrate-old-store-products.js`)
- ✅ Migra productos desde `productos_old_store.csv`
- ✅ Genera nuevos SKUs respetando el sistema actual
- ✅ Calcula precios de compra usando márgenes de subcategoría
- ✅ Mapea categorías/subcategorías correctamente
- ✅ Preserva inventario y características
- ✅ Crea tabla de mapeo SKU antiguo → nuevo

### Script de Imágenes (`migrate-images-to-s3.js`)
- 📸 Descarga imágenes desde WordPress
- 🔄 Procesa y optimiza con Sharp (4 tamaños)
- ☁️ Sube a AWS S3
- 🔗 Actualiza URLs en la base de datos
- 📊 Genera reporte de migración

## Instalación

```bash
cd scripts
npm install
```

## Configuración

### Base de Datos
Asegúrate de que Docker esté corriendo:
```bash
docker-compose up -d
```

### AWS S3 (para imágenes)
Configura las variables de entorno o edita el script:
```javascript
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=pequetienda
```

## Uso

### 1. Migrar Productos (Paso 1)

```bash
npm run migrate:products
```

Esto:
- Crea un cliente "Tienda Anterior WooCommerce"
- Genera una valuación con todos los productos
- Importa cada producto con:
  - Nuevo SKU (ej: HSAUTP45 → AUTP045)
  - Precios calculados correctamente
  - Estado `online_store_ready = true`
- Genera archivos:
  - `sku-mapping.json`: Mapeo de SKUs
  - `migration-errors.json`: Errores (si hay)

### 2. Verificar Configuración AWS (Opcional)

```bash
npm run migrate:images:verify
```

### 3. Migrar Imágenes (Paso 2)

```bash
npm run migrate:images
```

Por defecto procesa 10 productos como prueba. Para migrar todos, edita el script y quita `LIMIT 10`.

### 4. Migración Completa (Ambos pasos)

```bash
npm run migrate:all
```

## Estructura de SKUs

### Sistema Anterior (WooCommerce)
```
HSAUTP45 - Formato antiguo no estándar
HSCARP30 - HS + subcategoría + número
```

### Sistema Nuevo (Entrepeques)
```
AUTP045 - Autoasientos #45
CARP030 - Carriolas #30
JUGP001 - Juguetes #1
```

## Cálculo de Precios

### Fórmula Inversa
```javascript
// Del CSV tenemos precio de venta online
precio_venta_online = $3000

// Calculamos precio de compra usando margen de subcategoría
// Para Autoasientos: margin_used = 0.60
precio_compra = $3000 / 1.60 = $1875

// Precios adicionales
store_credit = $1875 * 1.10 = $2062.50
consignment = $1875 * 1.20 = $2250
```

## Verificación Post-Migración

### En Base de Datos
```sql
-- Ver productos migrados
SELECT COUNT(*) FROM valuation_items
WHERE notes LIKE '%SKU Original:%';

-- Ver mapeo de SKUs
SELECT * FROM sku_migration_map LIMIT 10;

-- Ver productos listos para tienda
SELECT i.id, vi.online_price, vi.online_featured
FROM inventario i
JOIN valuation_items vi ON i.valuation_item_id = vi.id
WHERE vi.online_store_ready = true
LIMIT 10;
```

### En Aplicación
1. Ir a http://localhost:4323/productos
2. Verificar que aparecen productos
3. Revisar imágenes y precios

## Solución de Problemas

### Error: SKU duplicado
- El script maneja automáticamente SKUs duplicados
- Genera siguiente número disponible

### Error: Categoría no encontrada
- Por defecto usa "A jugar > Juguetes"
- Revisa el mapeo en el script

### Error: Imagen no accesible
- El script mantiene URL original si falla
- Revisa `image-migration-*.json` para detalles

### Error: Sin precio
- Productos sin precio se saltan
- Revisa `migration-errors.json`

## Archivos Generados

- `sku-mapping.json`: Mapeo old → new SKU
- `migration-errors.json`: Productos con errores
- `image-migration-*.json`: Resultado de migración de imágenes

## Rollback

Si necesitas revertir:
```sql
-- Eliminar valuación y productos migrados
DELETE FROM valuations
WHERE notes LIKE '%Migración de productos del sistema anterior%';

-- Esto eliminará en cascada:
-- - valuation_items
-- - inventario (por el FK)
-- - sku_migration_map se puede limpiar manualmente

DROP TABLE IF EXISTS sku_migration_map;
```

## Notas Importantes

⚠️ **IMPORTANTE**:
- Los productos se marcan como `online_store_ready = true`
- Las imágenes inicialmente apuntan a WordPress
- La migración a S3 es un paso separado
- El sistema puede funcionar con imágenes de WordPress temporalmente

## Soporte

Para problemas o preguntas, revisar:
- Logs de Docker: `docker logs entrepeques-api-dev -f`
- Archivos de error generados
- Base de datos con pgAdmin: http://localhost:5050