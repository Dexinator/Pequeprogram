# Especificaciones de Desarrollo - Tienda Online Entrepeques

## Descripción General

La tienda online de Entrepeques es una plataforma de e-commerce especializada en la venta de artículos infantiles de segunda mano. El sistema está diseñado para manejar un inventario de productos únicos con características dinámicas según la categoría, integrándose completamente con el sistema de punto de venta existente.

## Arquitectura Técnica

### Stack Tecnológico
- **Frontend Framework**: Astro con React Islands
- **Estilos**: Tailwind CSS (última versión)
- **Backend**: API REST existente (Node.js + Express)
- **Base de Datos**: PostgreSQL
- **Almacenamiento de Imágenes**: AWS S3

### Estrategia de Renderizado

La aplicación utiliza una arquitectura híbrida de Astro:

- **SSG (Static Site Generation)**: Para páginas con contenido estático o semi-estático
  - Página de inicio
  - Listado de categorías
  - Páginas informativas (about, políticas, etc.)

- **SSR (Server Side Rendering)**: Para contenido dinámico que requiere datos en tiempo real
  - Páginas de productos
  - Resultados de búsqueda
  - Páginas de categorías con productos
  - Sección de ofertas

- **Islands Architecture**: Para componentes altamente interactivos
  - Carrito de compras
  - Filtros dinámicos
  - Sistema de búsqueda

## Modelo de Negocio

### Características del Inventario

1. **Productos Únicos**: La mayoría de los productos son piezas únicas. Cuando existe más de una unidad, es porque provienen del mismo proveedor y se registran en la tabla `inventario` con la cantidad correspondiente.

2. **Preparación Online**: Los productos se preparan una sola vez para todas las existencias en inventario, agregando:
   - Peso del producto
   - Imágenes optimizadas
   - Precio específico para venta online

3. **Variantes Dinámicas**: Cada subcategoría tiene diferentes `feature_definitions` que actúan como las características o variantes del producto.

4. **Sin Distinción por Modalidad**: Los productos en consignación se muestran y venden igual que los productos comprados directamente.

### Gestión de Stock

- **Unificación de Inventario**: El stock es único para tienda física y online
- **Actualización en Tiempo Real**: Las ventas online descuentan inmediatamente del inventario
- **Sin Reservas**: No se implementa sistema de reserva temporal de productos

## Estructura de Páginas

```
/                          → Home con productos destacados y categorías
/categorias                → Listado completo de categorías disponibles
/categoria/[slug]          → Productos filtrados por categoría
/subcategoria/[slug]       → Productos filtrados por subcategoría
/producto/[id]             → Detalle completo del producto
/buscar                    → Búsqueda avanzada con filtros
/carrito                   → Carrito de compras interactivo
/ofertas                   → Productos con descuentos especiales
/mi-cuenta                 → Panel de usuario (pedidos, datos)
/checkout                  → Proceso de compra
```

## Funcionalidades Principales

### 1. Sistema de Navegación y Búsqueda

#### Búsqueda Inteligente
- **Búsqueda por texto libre**: En nombre del producto, marca, descripción y características
- **Búsqueda por características**: Utilizando los `feature_definitions` de cada subcategoría
- **Autocompletado**: Sugerencias mientras el usuario escribe
- **Corrección ortográfica**: Sistema de "¿Quisiste decir?"
- **Historial**: Búsquedas recientes para usuarios autenticados

#### Sistema de Filtros Dinámicos
- **Filtros Comunes** (disponibles en todas las categorías):
  - Rango de precio
  - Estado/Condición
  - Marca
  - Ubicación (tienda)
  
- **Filtros Específicos**: Generados dinámicamente según los `feature_definitions` de cada subcategoría
  - Los filtros se adaptan al contexto de la categoría seleccionada
  - Faceted search mostrando cantidad de productos por filtro
  - Filtros múltiples acumulativos

### 2. Presentación de Productos

#### Vista de Grid
- **Diseño Responsive**: 
  - Móvil: 2 columnas
  - Tablet: 3 columnas
  - Desktop: 4 columnas
- **Información Visible**:
  - Imagen principal con segunda imagen al hover
  - Nombre del producto
  - Precio
  - Estado/Condición
  - Badges especiales ("Oferta", "Pieza única", "Últimas unidades")

#### Página de Detalle
- **Galería de Imágenes**:
  - Vista principal con thumbnails
  - Zoom al hacer hover
  - Navegación táctil en móvil
  - Lightbox para vista ampliada
  
- **Información del Producto**:
  - Descripción completa
  - Tabla de características dinámicas según subcategoría
  - Estado y condición detallados
  - Stock disponible
  - Precio (con precio anterior si hay descuento)

### 3. Carrito de Compras

#### Persistencia en Tres Capas
1. **localStorage**: Persistencia offline para usuarios no autenticados
2. **sessionStorage**: Navegación entre páginas
3. **Backend API**: Sincronización para usuarios autenticados

#### Funcionalidades
- Agregar/eliminar productos
- Modificar cantidades (respetando stock)
- Cálculo automático de totales
- Aplicación de descuentos
- Estimación de envío

### 4. Sistema de Ofertas y Descuentos

#### Campos en Base de Datos
- `discount_percentage`: Porcentaje de descuento
- `discount_valid_until`: Fecha de expiración
- `special_offer_text`: Texto promocional

#### Visualización
- Badge de descuento en grid y detalle
- Precio original tachado
- Precio con descuento destacado
- Contador regresivo para ofertas temporales
- Sección dedicada de ofertas

### 5. Productos Relacionados

#### Algoritmo de Recomendación
1. **Primera prioridad**: Productos de la misma subcategoría en rango de precio similar (±20%)
2. **Segunda prioridad**: Productos de la misma marca en otras categorías
3. **Tercera prioridad**: Productos de la misma categoría principal
4. **Límite**: Máximo 8 productos relacionados

## Consideraciones de UX/UI

### Diseño Visual
- **Mobile-first**: Prioridad al diseño móvil (70%+ del tráfico esperado)
- **Tema Entrepeques**: Uso de la paleta de colores corporativa
  - Rosa primario: #ff6b9d
  - Amarillo: #feca57
  - Azul claro: #74b9ff
  - Verde lima: #6c5ce7

### Optimización de Imágenes
- **Lazy Loading**: Carga diferida de imágenes fuera del viewport
- **Formatos Modernos**: WebP con fallback a JPEG
- **Tamaños Responsive**: Diferentes resoluciones según dispositivo
- **Optimización Automática**: Utilizando las capacidades nativas de Astro

### Accesibilidad
- Navegación por teclado
- Textos alternativos en imágenes
- Contraste adecuado (WCAG AA)
- Estructura semántica HTML5

## Integraciones

### API Backend
- **Endpoints Principales**:
  - `/api/store/products/ready`: Productos listos para venta online
  - `/api/inventory/search`: Búsqueda avanzada
  - `/api/sales`: Procesamiento de ventas

### Sistema de Pagos
- Integración con pasarela de pagos (por definir)
- Soporte para múltiples métodos de pago
- Webhook para confirmación de pagos

### Analytics
- Google Analytics 4
- Eventos de e-commerce
- Tracking de conversiones

## Seguridad

### Autenticación
- JWT tokens para usuarios autenticados
- Autenticación opcional para navegación
- Requerida para checkout y cuenta de usuario

### Protección de Datos
- HTTPS en toda la aplicación
- Sanitización de inputs
- Protección CSRF
- Rate limiting en endpoints críticos

## Performance

### Objetivos
- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

### Estrategias
- Code splitting por ruta
- Prefetch de rutas probables
- Service Worker para caching
- CDN para assets estáticos

## SEO

### Optimizaciones
- Meta tags dinámicos por página
- Schema.org markup para productos
- Sitemap XML automático
- URLs amigables y descriptivas
- Open Graph tags para redes sociales

### Contenido
- Descripciones únicas por producto
- Breadcrumbs para navegación
- Canonical URLs
- Robots.txt optimizado

## Mantenimiento y Escalabilidad

### Logging y Monitoreo
- Logs de errores centralizados
- Monitoreo de performance
- Alertas de stock bajo
- Analytics de uso

### Actualizaciones
- Sistema de deployments con zero-downtime
- Versionado de API
- Migraciones de base de datos automatizadas
- Backups regulares

## Fases de Implementación

### Componentes Core
1. Estructura base de páginas Astro
2. Sistema de componentes reutilizables
3. Integración con API existente
4. Sistema de autenticación

### Funcionalidades de Catálogo
1. Grid de productos con paginación
2. Filtros dinámicos por categoría
3. Sistema de búsqueda
4. Páginas de detalle con galería

### E-commerce
1. Carrito de compras persistente
2. Proceso de checkout
3. Integración de pagos
4. Confirmación de órdenes

### Optimizaciones
1. Sistema de ofertas
2. Productos relacionados
3. SEO y performance
4. Analytics y tracking