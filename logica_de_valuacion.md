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
- **Compra Directa**: Pago inmediato al cliente, precio más bajo
- **Consignación**: Sin pago inmediato, porcentaje mayor al vender
- Siempre calcular ambos valores, aunque el cliente elija solo una modalidad

### 5.3 Ajustes Manuales
- El sistema calcula precios sugeridos, pero el empleado puede ajustarlos
- Se deben guardar tanto el precio sugerido como el precio final para control

### 5.4 Historial y Trazabilidad
- Mantener registro de todas las valuaciones realizadas
- Permitir consulta por cliente, fecha, empleado, etc.
- Facilitar la búsqueda de artículos similares previamente valuados

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
  
valuation_factors
  id SERIAL PRIMARY KEY
  subcategory_id INTEGER REFERENCES subcategories(id)
  factor_type VARCHAR(50) NOT NULL -- estado, demanda, limpieza
  factor_value VARCHAR(50) NOT NULL -- valor (ej. "Bueno", "Alta", etc.)
  score INTEGER NOT NULL -- puntaje asociado
  
brands
  id SERIAL PRIMARY KEY
  name VARCHAR(100) NOT NULL
  category_id INTEGER REFERENCES categories(id)
  renown VARCHAR(20) NOT NULL -- Sencilla, Normal, Alta, Premium
  
valuations
  id SERIAL PRIMARY KEY
  client_id INTEGER REFERENCES clients(id)
  user_id INTEGER REFERENCES users(id)
  valuation_date TIMESTAMP DEFAULT NOW()
  total_purchase_amount DECIMAL(10,2)
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
  modality VARCHAR(20) NOT NULL -- compra directa, consignación
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

Este documento servirá como referencia para garantizar que la implementación del sistema mantenga la lógica de negocio correcta de Entrepeques. 