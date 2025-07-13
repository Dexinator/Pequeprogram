# Lógica de Valuación - Sistema Entrepeques

Este documento describe en detalle la lógica de negocio para el sistema de valuación de artículos infantiles de segunda mano de Entrepeques. Servirá como referencia para la implementación del backend y frontend del sistema.

## 1. Flujo del Proceso de Valuación

### 1.1 Pasos Generales

1. **Registro/Identificación del Cliente**
   - Buscar cliente existente o registrar nuevo
   - Capturar datos básicos (nombre, teléfono, email, identificación)

2. **Registro de Productos**
   - El cliente puede traer múltiples productos en una misma valuación
   - Cada producto requiere información específica (detallada en sección 2)
   - Se calcula el valor individual de cada producto
   
3. **Generación de Resumen**
   - Se calcula el valor total de compra
   - Se genera un documento para el cliente con detalles de cada producto y totales
   - Se finaliza la valuación y se procede al pago/consignación

## 2. Datos Requeridos por Producto

Para cada producto se requiere ingresar la siguiente información:

### 2.1 Información Básica
- **Categoría**: Define el tipo general de producto
- **Subcategoría**: Específica dentro de la categoría, determina los campos específicos disponibles
- **Status**: Estado general (Nuevo, Usado como nuevo, Usado con algún detalle)
- **Marca**: Nombre del fabricante, seleccionable de lista o añadible si no existe
- **Renombre de Marca**: Clasificación de prestigio (Sencilla, Normal, Alta, Premium)

### 2.2 Características Específicas
- **Features (1-10)**: Características específicas según la categoría
  - Pueden incluir: tamaño, capacidad, peso, color, cantidad de ruedas, etc.
  - Cada categoría puede tener hasta 10 features distintas

### 2.3 Estado y Modalidad
- **Modalidad**: 
  - Compra directa (pago inmediato)
  - Consignación (pago al vender)
- **Estado**: Condición física (Excelente, Bueno, Regular)
- **Demanda**: Popularidad actual (Alta, Media, Baja)
- **Limpieza**: Estado de higiene (Buena, Regular, Mala)

### 2.4 Información de Mercado
- **Precio Nuevo**: Valor de referencia del producto nuevo (investigado por el empleado)
  - Obtenido mediante búsqueda en internet
  - O consultando base de datos de compras anteriores similares

## 3. Fórmulas de Cálculo

El sistema utiliza las siguientes fórmulas para determinar los precios:

### 3.1 Calificaciones

- **Calificación Compra** = Suma de puntajes de (Estado + Demanda + Limpieza)
  - Cada característica tiene valores asociados (ej. Buena +5, Regular +0, Mala -5)

- **Calificación Venta** = Suma de puntajes de (Estado + Demanda)
  - Similar a Calificación Compra pero sin considerar Limpieza

### 3.2 Cálculo de Precios

- **Precio de Venta** = Precio_Nuevo × (1 - GAP + Calificación_Venta/100)
  - GAP: Factor definido por subcategoría, diferente para productos nuevos y usados

- **Precio de Compra** = Precio_Venta × (1 - Margen + Calificación_Compra/100)
  - Margen: Factor definido por categoría, diferente para productos nuevos y usados

## 4. Tablas de Referencia Necesarias

Para implementar esta lógica, se requieren las siguientes tablas:

### 4.1 Tabla de Categorías y Subcategorías
- Identificadores y nombres
- Relación jerárquica

### 4.2 Tabla de Features por Subcategoría
- Features disponibles por cada subcategoría
- Tipo de dato de cada feature (numérico, texto, selección)
- Valores permitidos para features de selección

### 4.3 Tabla de Marcas
- Listado de marcas por categoría
- Clasificación de renombre (Sencilla, Normal, Alta, Premium)

### 4.4 Tabla de Factores de Valuación
- GAP por subcategoría (para nuevo y usado)
- Margen por categoría (para nuevo y usado)

### 4.5 Tabla de Puntajes
- Valores numéricos para cada opción de Estado, Demanda y Limpieza
- Los puntajes pueden variar según la subcategoría del producto
- Ejemplo para una subcategoría específica:
  ```
  Estado:
    - Excelente: +10
    - Bueno: +5
    - Regular: 0
  
  Demanda:
    - Alta: +10
    - Media: +5
    - Baja: 0
  
  Limpieza:
    - Buena: +5
    - Regular: 0
    - Mala: -5
  ```

## 5. Consideraciones Adicionales

### 5.1 Valuación Múltiple
- Un cliente puede traer varios productos en una misma sesión de valuación
- Cada producto se valúa independientemente
- Se genera un resumen con todos los artículos

### 5.2 Modalidades de Pago
- **Compra Directa**: Pago inmediato al cliente en efectivo, precio base
- **Crédito en Tienda**: Pago mediante vales/créditos canjeables únicamente en la tienda, 10% más que compra directa  
- **Consignación**: Sin pago inmediato, porcentaje mayor al vender (20% más que compra directa)
- Siempre calcular los tres valores, aunque el cliente elija solo una modalidad

### 5.6 Metodología Especial para Ropa
- **Sistema de Precios Fijos**: La ropa utiliza precios predefinidos basados en tipo de prenda y calidad
- **No requiere precio nuevo**: El sistema consulta automáticamente la tabla `clothing_valuation_prices`
- **Categorías de Ropa**: 5 grupos principales
  - Cuerpo completo: Abrigos, vestidos, conjuntos, pijamas
  - Arriba de cintura: Playeras, camisas, chamarras, sudaderas
  - Abajo de cintura: Pantalones, shorts, faldas, leggins
  - Calzado: Tennis, zapatos, botas, sandalias
  - Dama/Maternidad: Ropa de maternidad y accesorios

**Niveles de Calidad:**
- Económico: Marcas básicas o genéricas
- Estándar: Marcas comerciales conocidas
- Alto: Marcas premium o de diseñador
- Premium: Marcas de lujo o alta gama

**Cálculo de Precios para Ropa:**
- Precio de compra: Fijo según tabla (tipo × calidad)
- Precio de venta: Se calcula con la fórmula estándar usando un precio nuevo estimado
- Crédito en tienda: Precio de compra × 1.1
- Consignación: Precio de compra × 1.2

### 5.3 Generación de Ofertas de Compra
- **Documento de Oferta**: Se genera automáticamente para productos con modalidad "Compra Directa" y "Crédito en Tienda"
- **Impresión Optimizada**: Documento con formato profesional incluyendo:
  - Información de la empresa (Entrepeques)
  - Datos del proveedor/cliente
  - Lista detallada de productos con descripciones inteligentes
  - Totales separados por modalidad de pago
  - Términos y condiciones (válida por 7 días)
- **Descripción de Productos**: Se genera automáticamente usando características importantes (offer_print=TRUE en feature_definitions)
- **Acceso desde Historial**: Funcionalidad disponible tanto en nueva valuación como en historial de valuaciones

### 5.4 Ajustes Manuales
- El sistema calcula precios sugeridos, pero el empleado puede ajustarlos
- Se deben guardar tanto el precio sugerido como el precio final para control

### 5.5 Historial y Trazabilidad
- Mantener registro de todas las valuaciones realizadas
- Permitir consulta por cliente, fecha, empleado, etc.
- Facilitar la búsqueda de artículos similares previamente valuados
- **Funcionalidad de Impresión**: Impresión de ofertas directamente desde el historial de valuaciones

## 6. Implementación en Base de Datos

Para implementar esta lógica, se requieren las siguientes tablas principales:

```
categories
  id SERIAL PRIMARY KEY
  name VARCHAR(100) NOT NULL
  description TEXT
  parent_id INTEGER REFERENCES categories(id)
  is_active BOOLEAN DEFAULT TRUE
  
subcategories
  id SERIAL PRIMARY KEY
  category_id INTEGER REFERENCES categories(id)
  name VARCHAR(100) NOT NULL
  description TEXT
  gap_new DECIMAL(5,2) NOT NULL  -- GAP para productos nuevos
  gap_used DECIMAL(5,2) NOT NULL -- GAP para productos usados
  margin_new DECIMAL(5,2) NOT NULL -- Margen para productos nuevos
  margin_used DECIMAL(5,2) NOT NULL -- Margen para productos usados
  
feature_definitions
  id SERIAL PRIMARY KEY
  subcategory_id INTEGER REFERENCES subcategories(id)
  name VARCHAR(100) NOT NULL
  display_name VARCHAR(100) NOT NULL
  type VARCHAR(20) NOT NULL -- texto, numero, seleccion
  order_index INTEGER NOT NULL -- orden de visualización
  options JSONB -- opciones para tipo seleccion
  mandatory BOOLEAN DEFAULT FALSE -- si el campo es obligatorio
  offer_print BOOLEAN DEFAULT FALSE -- si aparece en ofertas impresas
  
valuation_factors
  id SERIAL PRIMARY KEY
  subcategory_id INTEGER REFERENCES subcategories(id)
  factor_type VARCHAR(50) NOT NULL -- estado, demanda, limpieza
  factor_value VARCHAR(50) NOT NULL -- valor (ej. "Bueno", "Alta", etc.)
  score INTEGER NOT NULL -- puntaje asociado
  
brands
  id SERIAL PRIMARY KEY
  name VARCHAR(100) NOT NULL
  subcategory_id INTEGER REFERENCES subcategories(id)
  renown VARCHAR(20) NOT NULL -- Sencilla, Normal, Alta, Premium
  
valuations
  id SERIAL PRIMARY KEY
  client_id INTEGER REFERENCES clients(id)
  user_id INTEGER REFERENCES users(id)
  valuation_date TIMESTAMP DEFAULT NOW()
  total_purchase_amount DECIMAL(10,2)
  total_store_credit_amount DECIMAL(10,2)
  total_consignment_amount DECIMAL(10,2)
  status VARCHAR(20) DEFAULT 'pending'
  notes TEXT
  
valuation_items
  id SERIAL PRIMARY KEY
  valuation_id INTEGER REFERENCES valuations(id)
  category_id INTEGER REFERENCES categories(id)
  subcategory_id INTEGER REFERENCES subcategories(id)
  brand_id INTEGER REFERENCES brands(id)
  status VARCHAR(50) NOT NULL -- Nuevo, Usado como nuevo, etc.
  brand_renown VARCHAR(20) NOT NULL
  modality VARCHAR(20) NOT NULL -- compra directa, crédito en tienda, consignación
  condition_state VARCHAR(20) NOT NULL -- excelente, bueno, regular
  demand VARCHAR(20) NOT NULL -- alta, media, baja
  cleanliness VARCHAR(20) NOT NULL -- buena, regular, mala
  features JSONB -- características específicas
  new_price DECIMAL(10,2) NOT NULL -- precio nuevo de referencia
  purchase_score INTEGER -- puntaje calculado para compra
  sale_score INTEGER -- puntaje calculado para venta
  suggested_purchase_price DECIMAL(10,2) -- precio de compra sugerido
  suggested_sale_price DECIMAL(10,2) -- precio de venta sugerido
  final_purchase_price DECIMAL(10,2) -- precio de compra final
  final_sale_price DECIMAL(10,2) -- precio de venta final
  consignment_price DECIMAL(10,2) -- precio en caso de consignación
  store_credit_price DECIMAL(10,2) -- precio para crédito en tienda
  images JSONB -- URLs de imágenes
  notes TEXT
```

## 7. Proceso de Cálculo de Valuación en Backend

1. Recibir datos del producto desde el frontend
2. Consultar GAP y Margen según subcategoría y estado (nuevo/usado)
3. Calcular Calificación Compra y Calificación Venta según valores en tabla valuation_factors
4. Aplicar fórmulas de cálculo para obtener precio de venta y compra sugeridos
5. Devolver resultado al frontend
6. Almacenar valuación completa cuando se finalice

## 8. Sistema de Valuación de Ropa

### 8.1 Flujo Específico para Ropa

1. **Detección Automática**:
   - Sistema detecta cuando se selecciona una subcategoría de ropa (is_clothing = true)
   - Muestra automáticamente el formulario especializado ClothingProductForm

2. **Captura de Información**:
   - Tipo de prenda (desde lista predefinida por categoría)
   - Nivel de calidad (económico, estándar, alto, premium)
   - Marca (campo de texto libre)
   - Talla (desde lista específica por tipo: general, calzado, maternidad)
   - Color
   - Estado, condición, demanda y limpieza (igual que otros productos)

3. **Cálculo de Precios**:
   - Precio de compra: Búsqueda directa en tabla clothing_valuation_prices
   - No requiere ingresar precio nuevo manualmente
   - Precio de venta: Calculado con fórmula estándar usando precio estimado

### 8.2 Ejemplo de Precios de Ropa

| Tipo de Prenda | Económico | Estándar | Alto | Premium |
|----------------|-----------|----------|------|---------|
| Abrigo | $40 | $70 | $130 | $170 |
| Playera M/corta | $15 | $20 | $40 | $60 |
| Pantalón Mezclilla | $30 | $40 | $70 | $130 |
| Tennis | $35 | $50 | $100 | $130 |
| Vestido de fiesta | $40 | $60 | $120 | $150 |

### 8.3 Ventajas del Sistema de Ropa

- **Rapidez**: Valuación 80% más rápida que el método tradicional
- **Consistencia**: Precios estandarizados evitan variaciones
- **Simplicidad**: No requiere investigación de precios en internet
- **Flexibilidad**: Precios de venta siguen respondiendo a condición y demanda

## 9. Proceso de Generación de Ofertas de Compra

### 9.1 Flujo de Impresión de Ofertas

1. **Desde Nueva Valuación**:
   - Una vez completado el resumen de productos
   - Se filtran automáticamente productos con modalidad "Compra Directa" y "Crédito en Tienda"
   - Se genera documento de oferta en modal
   - Usuario puede imprimir directamente

2. **Desde Historial de Valuaciones**:
   - Usuario selecciona valuación desde tabla de historial
   - Clic en botón "Imprimir" (icono de impresora)
   - Sistema obtiene valuación completa via API `getValuation(id)`
   - Se filtran productos válidos para oferta
   - Se calcula totales por modalidad
   - Se muestra modal con documento de oferta
   - Usuario puede imprimir desde modal

### 9.2 Lógica de Descripción de Productos

La descripción de productos en las ofertas se genera siguiendo esta prioridad:

1. **Nombre del Producto**: Subcategoría > Categoría > "Artículo"
2. **Características Importantes**: Campos con `offer_print=TRUE`:
   - `modelo`, `talla`, `edad`, `tipo`, `tamano`, `color`, `size`
   - Máximo 2 características más importantes
3. **Marca**: Solo si no es genérica ("Sin marca", "Genérica")
4. **Estado**: Solo para productos usados con descripción del estado

Ejemplo de descripción generada:
- "Autoasiento - Portabebé 0-13 kg, Ajustable alturas - Chicco - Estado Excelente"
- "Cuna Estándar - Incluye colchón - Buen Estado"

### 9.3 Configuración de Características para Ofertas

En la tabla `feature_definitions`, el campo `offer_print` determina qué características aparecen en las ofertas:

- `offer_print = TRUE`: Características importantes que aparecen en descripciones
- `offer_print = FALSE`: Características internas que no aparecen en ofertas

Características comunes con `offer_print = TRUE`:
- **modelo**: Tipo específico del producto
- **talla**: Talla de ropa/calzado  
- **tipo**: Variante del producto
- **incluye_colchon**: Si incluye accesorios importantes

### 9.4 Estructura del Documento de Oferta

1. **Encabezado Empresarial**:
   - Logo y nombre "Entrepeques"
   - Dirección: Av. Homero 1616, Polanco, Miguel Hidalgo, CDMX 11510
   - Teléfono: 55 6588 3245
   - Email: contacto@entrepeques.mx

2. **Información de la Oferta**:
   - Título "OFERTA DE COMPRA"
   - Fecha actual
   - Validez: 7 días

3. **Datos del Proveedor**:
   - Nombre, teléfono, email, identificación del cliente

4. **Tabla de Productos**:
   - Número consecutivo
   - Descripción inteligente del producto
   - Modalidad de pago (Efectivo/Crédito en tienda)
   - Cantidad
   - Precio unitario
   - Total por producto

5. **Totales**:
   - Total en efectivo (compra directa)
   - Total en crédito en tienda
   - Gran total

6. **Términos y Condiciones**:
   - Validez de 7 días
   - Condiciones de pago
   - Información sobre crédito en tienda

Este documento servirá como referencia para garantizar que la implementación del sistema mantenga la lógica de negocio correcta de Entrepeques. 