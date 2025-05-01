# Plan de Implementación: Modernización de Entrepeques

## 1. Resumen del Proyecto

**Objetivo:** Reemplazar los sistemas actuales (Valuador en VB, My Business POS, WooCommerce) por una plataforma web unificada y moderna para gestionar la valuación, inventario, tienda en línea y punto de venta físico de Entrepeques.

**Tecnologías Principales:**
*   **Frontend:** Astro (con TypeScript)
*   **Backend:** Node.js con Express (con TypeScript)
*   **Base de Datos:** PostgreSQL
*   **Hosting:** Vercel (Frontend), Heroku (Backend + DB)
*   **Arquitectura:** Monorepo, Subdominios, Backend Monolito Modular, Puente Local para Impresora POS.
*   **Desarrollo:** Docker / Docker Compose

**Dominios Propuestos:**
*   `tienda.entrepeques.com`: Tienda en línea para clientes.
*   `valuador.entrepeques.com`: Aplicación interna para la valuación de artículos.
*   `admin.entrepeques.com`: Panel de administración interna.
*   `pos.entrepeques.com`: Interfaz del Punto de Venta físico.
*   `api.entrepeques.com`: API Backend central.

## 2. Fases del Proyecto

### Fase 1: Fundación y API Core (Backend)
*   **Tareas:**
    *   Configurar monorepo (ej. `pnpm workspaces` o `Nx`).
    *   Configurar entorno de desarrollo con Docker (`docker-compose.yml` para Backend y PostgreSQL).
    *   Inicializar proyecto Backend (Node.js, Express, TypeScript) dentro de la estructura del monorepo.
    *   Configurar conexión a base de datos PostgreSQL (leyendo configuración para Docker dev y Heroku prod).
    *   Diseñar e implementar esquema inicial de BD: `Users`, `Categories`, `Products` (con campos básicos), `Roles`.
    *   Implementar autenticación y autorización básica (ej. JWT).
    *   Desarrollar endpoints CRUD básicos para `Categories` y `Products`.
    *   Configurar linters, formateadores (ESLint, Prettier) y scripts base.
    *   Configurar despliegue inicial del backend en Heroku (`api.entrepeques.com`).
*   **Entregable:** API funcional con gestión básica de usuarios, categorías y productos, desplegada en Heroku, y entorno de desarrollo Dockerizado.

### Fase 2: Aplicación Valuador
*   **Tareas:**
    *   Inicializar proyecto Frontend para Valuador (Astro, TypeScript).
    *   Diseñar UI/UX del proceso de valuación.
    *   Ampliar esquema BD: Tabla `Valuations` (vinculada a `Products`, `Users`), campos detallados (estado, demanda, marca, etc.), tabla `ValuationRules` (para almacenar lógica/tablas de valuación).
    *   Desarrollar lógica de negocio en el Backend para calcular valuaciones basadas en reglas y atributos del producto.
    *   Implementar endpoints API para crear, consultar y gestionar valuaciones.
    *   Desarrollar componentes UI en Astro para el formulario de valuación y visualización de resultados.
    *   Conectar Frontend con Backend para el flujo completo de valuación.
    *   Configurar despliegue del valuador en Vercel (`valuador.entrepeques.com`).
*   **Entregable:** Aplicación web funcional para realizar y consultar valuaciones de artículos.

### Fase 3: Gestión de Inventario y Panel de Administración
*   **Tareas:**
    *   Inicializar proyecto Frontend para Admin (Astro, TypeScript).
    *   Ampliar esquema BD: Tabla `InventoryItems` (vinculada a `Valuations` o `Products`, con campos como `sku`, `purchase_price`, `selling_price`, `status` [en stock, vendido, etc.], `location`).
    *   Desarrollar lógica de Backend para gestionar el ciclo de vida del inventario (desde valuación aceptada hasta venta).
    *   Implementar endpoints API para CRUD de `InventoryItems`, gestión de usuarios, categorías, reglas de valuación.
    *   Desarrollar UI del Panel de Administración para:
        *   Ver/Gestionar Usuarios y Roles.
        *   Ver/Gestionar Categorías y Productos base.
        *   Ver/Aprobar/Rechazar Valuaciones.
        *   Ver/Gestionar Inventario (asignar precios de venta, marcar como comprado, etc.).
        *   Gestionar Reglas de Valuación.
    *   Asegurar rutas de API y Frontend del panel de administración.
    *   Configurar despliegue del admin en Vercel (`admin.entrepeques.com`).
*   **Entregable:** Panel de administración para gestionar entidades clave y el inventario.

### Fase 4: Tienda en Línea (Frontend Público)
*   **Tareas:**
    *   Inicializar proyecto Frontend para Tienda (Astro, TypeScript).
    *   Diseñar UI/UX pública (listado de productos, detalle, carrito).
    *   Implementar endpoints API públicos (lectura) para obtener productos en stock, categorías, detalles de producto.
    *   Desarrollar componentes Astro para:
        *   Página de inicio.
        *   Listado de productos (con filtros y búsqueda).
        *   Página de detalle de producto.
        *   Carrito de compras (puede ser state local o en backend).
    *   Conectar Frontend con API para mostrar datos.
    *   Optimizar para SEO y rendimiento (Astro ayuda mucho aquí).
    *   Configurar despliegue de la tienda en Vercel (`tienda.entrepeques.com`).
*   **Entregable:** Frontend de la tienda en línea mostrando productos del inventario.

### Fase 5: Punto de Venta (POS) Físico
*   **Tareas:**
    *   Inicializar proyecto Frontend para POS (Astro, TypeScript, enfocado en simplicidad y rapidez).
    *   Diseñar UI/UX del POS: Búsqueda/escaneo rápido, añadir a venta, seleccionar cliente (opcional), totalizar, registrar pago.
    *   Integrar lector de códigos de barras (como entrada de teclado HID).
    *   Ampliar esquema BD: Tabla `Orders` (con `OrderItems`), `Customers` (opcional), `Payments`.
    *   Desarrollar lógica y endpoints API para crear órdenes desde el POS, registrar pagos y actualizar el estado del inventario.
    *   Desarrollar la **Aplicación Puente para Impresora Local**:
        *   Tecnología: Node.js (con pkg para empaquetar) o Electron.
        *   Funcionalidad: Conectarse a la API (via WebSockets o polling) para recibir eventos de "imprimir ticket", comunicarse con la impresora local (USB/Red) usando comandos ESC/POS para formatear e imprimir tickets y abrir cajón.
    *   Implementar comunicación entre POS Frontend -> API -> Aplicación Puente Local.
    *   Configurar despliegue del POS en Vercel (`pos.entrepeques.com`).
*   **Entregable:** Interfaz web POS funcional y aplicación local para imprimir tickets.

### Fase 6: Procesamiento de Pagos y Checkout
*   **Tareas:**
    *   Seleccionar e integrar un Proveedor de Servicios de Pago (PSP) (ej. Stripe, Mercado Pago).
    *   Implementar lógica en el Backend para interactuar con la API del PSP (crear intentos de pago, manejar webhooks de confirmación).
    *   Implementar flujo de checkout completo en la Tienda en Línea (Frontend): introducir datos, seleccionar envío (si aplica), pagar.
    *   Implementar registro de métodos de pago en el POS Frontend (efectivo, tarjeta via terminal externa, enlace de pago del PSP).
    *   Actualizar estado de `Orders` y `Payments` tras confirmación del pago.
    *   Implementar notificaciones básicas (ej. email de confirmación de orden).
*   **Entregable:** Flujo de pago funcional tanto en la tienda online como en el POS.

### Fase 7: Pruebas, Despliegue Final y Migración
*   **Tareas:**
    *   Implementar estrategia de pruebas: Unitarias (Backend/Frontend), Integración (API), End-to-End (flujos completos).
    *   Realizar pruebas exhaustivas en todos los módulos.
    *   Optimizar rendimiento y seguridad.
    *   Preparar scripts o procesos para migrar datos existentes (si es viable desde VB/MyBusiness/WooCommerce a PostgreSQL).
    *   Realizar la migración de datos.
    *   Entrenamiento del personal sobre el nuevo sistema.
    *   Configuraciones finales de despliegue (DNS, variables de entorno, monitorización).
    *   Lanzamiento oficial (Go Live).
*   **Entregable:** Sistema completo desplegado, probado, con datos migrados (si aplica) y personal entrenado.

## 3. Consideraciones Adicionales y Futuras

*   **UI/UX:** Dedicar tiempo al diseño para que las interfaces sean intuitivas y eficientes.
*   **Informes/Analíticas:** Planificar qué informes serán necesarios y cómo se generarán (vistas en BD, endpoints API específicos).
*   **Marketing:** Funcionalidades como cupones, descuentos, reseñas de productos.
*   **Escalabilidad:** Monitorizar rendimiento y planificar escalado de BD y Backend si es necesario.
*   **Mantenimiento:** Plan de actualizaciones de dependencias y backups. 