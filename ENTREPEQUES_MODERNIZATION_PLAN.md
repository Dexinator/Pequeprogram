# Plan de Implementación: Modernización de Entrepeques

## 1. Resumen del Proyecto

**Objetivo:** Reemplazar los sistemas actuales (Valuador en VB, My Business POS, WooCommerce) por una plataforma web unificada y moderna para gestionar la valuación, inventario, tienda en línea y punto de venta físico de Entrepeques.

**Tecnologías Principales:**
*   **Frontend:** Astro (con React y TypeScript)
    *   **Estilos:** Tailwind CSS 4.1
    *   **Tema:** Sistema de variables CSS y modo oscuro
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

#### Detalles de Implementación de Autenticación

La autenticación se implementa utilizando JSON Web Tokens (JWT) con las siguientes características:

1. **Registro de usuarios**:
   - Endpoint: `POST /api/auth/register`
   - Campos requeridos: `username`, `email`, `password`, `first_name`, `last_name`, `role_id`
   - La contraseña se almacena hasheada usando bcrypt (10 rondas de salt)
   - Validación de unicidad de username y email

2. **Login de usuarios**:
   - Endpoint: `POST /api/auth/login`
   - Campos requeridos: `username`, `password`
   - Retorna token JWT y datos del usuario (sin contraseña)
   - El token incluye: `userId`, `username`, `role`
   - Expiración del token: 24 horas

3. **Middleware de autenticación**:
   - Verifica token JWT en header `Authorization`
   - Añade información del usuario a `req.user`
   - Middleware adicional para verificación de roles

4. **Obtener usuario actual**:
   - Endpoint: `GET /api/auth/me`
   - Protegido por middleware de autenticación
   - Retorna datos del usuario actual

5. **Gestión de usuarios**:
   - Endpoints CRUD para usuarios en `/api/users`
   - Protegidos por middleware de autenticación y roles
   - Soporte para búsqueda, filtrado y paginación

6. **Gestión de roles**:
   - Endpoints para obtener y gestionar roles en `/api/roles`
   - Roles predefinidos: admin, manager, valuator, sales

7. **Consideraciones de seguridad**:
   - Validación de datos de entrada
   - Protección contra inyección SQL
   - Manejo seguro de contraseñas con bcrypt
   - Verificación de permisos basada en roles
   - Mensajes de error genéricos para evitar fugas de información

### Fase 2: Aplicación Valuador
*   **Tareas:**
    *   Inicializar proyecto Frontend para Valuador (Astro + React, TypeScript).
    *   Diseñar UI/UX del proceso de valuación.
    *   Ampliar esquema BD: Tabla `Valuations` (vinculada a `Products`, `Users`), campos detallados (estado, demanda, marca, etc.), tabla `ValuationRules` (para almacenar lógica/tablas de valuación).
    *   Desarrollar lógica de negocio en el Backend para calcular valuaciones basadas en reglas y atributos del producto.
    *   Implementar endpoints API para crear, consultar y gestionar valuaciones.
    *   Desarrollar componentes UI en Astro para el formulario de valuación y visualización de resultados.
    *   Conectar Frontend con Backend para el flujo completo de valuación.
    *   Configurar despliegue del valuador en Vercel (`valuador.entrepeques.com`).
*   **Entregable:** Aplicación web funcional para realizar y consultar valuaciones de artículos.

### Fase 3: Sistema de Ventas Físicas ✅ COMPLETADA
*   **Tareas Completadas:**
    *   ✅ Implementar gestión automática de inventario desde valuaciones
    *   ✅ Crear tablas: `inventario`, `sales`, `sale_items`, `payment_details`
    *   ✅ Desarrollar sistema completo de ventas con clientes registrados y ocasionales
    *   ✅ Implementar sistema de pagos mixtos (efectivo, tarjeta, transferencia)
    *   ✅ Crear interfaz de nueva venta con flujo de 4 pasos
    *   ✅ Desarrollar historial de ventas con estadísticas en tiempo real
    *   ✅ Integrar búsqueda de productos en inventario con filtros
    *   ✅ Implementar validaciones robustas y transacciones ACID
    *   ✅ Crear generación automática de IDs de inventario basados en SKU
    *   ✅ Documentar completamente el módulo de ventas
*   **Entregable Completado:** Sistema completo de ventas para tienda física integrado con el sistema de valuación, con capacidades profesionales de manejo de inventario, clientes y pagos mixtos.

### Fase 4: Panel de Administración y Gestión de Usuarios
*   **Tareas:**
    *   Inicializar proyecto Frontend para Admin (Astro + React, TypeScript)
    *   Desarrollar UI del Panel de Administración para:
        *   Ver/Gestionar Usuarios y Roles
        *   Ver/Gestionar Categorías y Productos base
        *   Ver/Aprobar/Rechazar Valuaciones pendientes
        *   Ver/Gestionar Inventario (asignar precios, marcar disponibilidad)
        *   Gestionar Reglas de Valuación y configuraciones
        *   Dashboard con métricas y reportes del negocio
    *   Implementar endpoints API para gestión administrativa
    *   Asegurar permisos y roles para acceso administrativo
    *   Configurar despliegue del admin en Vercel (`admin.entrepeques.com`)
*   **Entregable:** Panel de administración completo para gestionar el sistema.

### Fase 5: Tienda en Línea (Frontend Público)
*   **Tareas:**
    *   Inicializar proyecto Frontend para Tienda (Astro + React, TypeScript)
    *   Diseñar UI/UX pública (listado de productos, detalle, carrito)
    *   Implementar endpoints API públicos para productos en stock, categorías
    *   Desarrollar componentes para:
        *   Página de inicio con productos destacados
        *   Listado de productos con filtros y búsqueda
        *   Página de detalle de producto con imágenes
        *   Carrito de compras y proceso de checkout
    *   Conectar Frontend con API para mostrar inventario disponible
    *   Optimizar para SEO y rendimiento con Astro
    *   Configurar despliegue en Vercel (`tienda.entrepeques.com`)
*   **Entregable:** Frontend de tienda en línea mostrando productos del inventario.

### Fase 6: Sistema POS Avanzado y Puente de Impresión
*   **Tareas:**
    *   Inicializar proyecto Frontend para POS (Astro + React, enfocado en simplicidad)
    *   Diseñar UI/UX del POS: búsqueda rápida, añadir a venta, totalizar, registrar pago
    *   Integrar lector de códigos de barras (entrada de teclado HID)
    *   Ampliar esquema BD: Tabla `Orders` (con `OrderItems`), `Customers`, `Payments`
    *   Desarrollar endpoints API para crear órdenes, registrar pagos, actualizar inventario
    *   Desarrollar **Aplicación Puente para Impresora Local**:
        *   Tecnología: Node.js (con pkg) o Electron
        *   Funcionalidad: WebSockets/polling con API, comandos ESC/POS, impresión local
    *   Implementar comunicación POS Frontend → API → Aplicación Puente Local
    *   Configurar despliegue del POS en Vercel (`pos.entrepeques.com`)
*   **Entregable:** Interfaz web POS funcional y aplicación local para imprimir tickets.

### Fase 7: Procesamiento de Pagos y Integración Final
*   **Tareas:**
    *   Seleccionar e integrar PSP (Stripe, Mercado Pago)
    *   Implementar lógica Backend para PSP (pagos, webhooks)
    *   Implementar checkout completo en Tienda en Línea
    *   Integrar métodos de pago en POS (efectivo, tarjeta, PSP)
    *   Actualizar estado de órdenes tras confirmación de pago
    *   Implementar notificaciones (email de confirmación)
    *   Implementar pruebas exhaustivas (unitarias, integración, E2E)
    *   Optimizar rendimiento y seguridad
    *   Preparar migración de datos existentes
    *   Entrenar personal en el nuevo sistema
    *   Configurar DNS, variables de entorno, monitoreo
    *   Lanzamiento oficial (Go Live)
*   **Entregable:** Sistema completo desplegado y listo para producción.

## 3. Consideraciones Adicionales y Futuras

*   **UI/UX:** Dedicar tiempo al diseño para que las interfaces sean intuitivas y eficientes.
*   **Informes/Analíticas:** Planificar qué informes serán necesarios y cómo se generarán (vistas en BD, endpoints API específicos).
*   **Marketing:** Funcionalidades como cupones, descuentos, reseñas de productos.
*   **Escalabilidad:** Monitorizar rendimiento y planificar escalado de BD y Backend si es necesario.
*   **Mantenimiento:** Plan de actualizaciones de dependencias y backups.

## 4. Detalles de Implementación Frontend

### Tailwind CSS 4.1
La plataforma utilizará Tailwind CSS 4.1 para todos los estilos, siguiendo la guía de instalación oficial para Astro. Aprovechará las nuevas características de Tailwind 4.1, incluyendo:

* Plugin de Vite para integración más eficiente
* Sistema de importación CSS simplificado
* Uso de la nueva sintaxis `@import "tailwindcss"`

### Sistema de Temas y Modo Oscuro
Se implementará un sistema de temas completo utilizando:

* Variables CSS nativas a través de la función `@theme` de Tailwind
* Configuración de color-scheme para modo claro/oscuro
* Personalización basada en la identidad visual de Entrepeques
* Transiciones suaves entre temas
* Detección de preferencias del sistema y persistencia de preferencias del usuario

Las variables del tema incluirán:
* Paleta de colores de marca (rosa, amarillo, azul claro, verde lima, verde oscuro, azul profundo)
* Tipografías (Poppins, Muli/Inter, Fredoka One)
* Espaciados consistentes
* Radios de borde
* Sombras

### Optimización de Imágenes
Se aprovecharán las capacidades nativas de Astro para la optimización de imágenes:

* Uso del componente `<Image />` de Astro para imágenes optimizadas
* Generación automática de formatos modernos (WebP, AVIF)
* Carga perezosa (lazy loading) para todas las imágenes
* Manejo de imágenes responsive
* Implementación de estrategias de placeholder para mejorar la percepción de carga

Todas las imágenes de productos se procesarán mediante esta canalización para garantizar tiempos de carga óptimos y buena experiencia de usuario en todos los dispositivos.