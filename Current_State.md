# Bitácora del Proyecto Entrepeques

## Sesión: 30 de Abril, 2025

### 1. Planificación del Proyecto

**Acción realizada:** Creación de un plan detallado de implementación.
**Procedimiento:**
- Discutimos las necesidades del negocio Entrepeques (compra/venta de artículos infantiles).
- Evaluamos los sistemas actuales (Valuador en VB, My Business POS, WooCommerce).
- Establecimos objetivos para modernizar la infraestructura usando tecnologías web.
- Definimos el stack tecnológico: Astro (frontend), Node.js/Express (backend), PostgreSQL (base de datos).
- Creamos el archivo `ENTREPEQUES_MODERNIZATION_PLAN.md` con un plan de 7 fases.
- Detallamos la arquitectura usando subdominios y monorepo.

### 2. Configuración del Monorepo

**Acción realizada:** Configurar estructura base del monorepo.
**Procedimiento:**
```bash
# Inicializar pnpm en la raíz
pnpm init

# Crear archivo de configuración de workspace
# Contenido añadido en pnpm-workspace.yaml:
# packages:
#   - 'apps/*'
#   - 'packages/*'

# Crear directorios principales
mkdir apps
mkdir packages
```

### 3. Configuración de Git

**Acción realizada:** Preparación del repositorio para Git.
**Procedimiento:**
- Creamos un archivo `.gitignore` en la raíz con patrones comunes para:
  - Node.js (`node_modules`, logs, `.env`)
  - Herramientas de build (`.cache`, `dist`)
  - Astro (`.astro`)
  - IDE/Editores (`.vscode`, `.idea`)
  - Sistemas operativos (`.DS_Store`, `Thumbs.db`)

### 4. Configuración del Entorno Docker

**Acción realizada:** Crear docker-compose.yml con servicios para PostgreSQL y API.
**Procedimiento:**
```yaml
# docker-compose.yml simplificado:
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USER:-user}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-password}
      POSTGRES_DB: ${DATABASE_NAME:-entrepeques_dev}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile.dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DATABASE_USER:-user}:${DATABASE_PASSWORD:-password}@db:5432/${DATABASE_NAME:-entrepeques_dev}
    volumes:
      - ./packages/api:/app
    depends_on:
      - db
```

### 5. Creación del Backend Inicial

**Acción realizada:** Inicializar proyecto Node.js/Express/TypeScript.
**Procedimiento:**
```bash
# Crear directorio para la API
mkdir packages/api

# Inicializar package.json dentro del directorio
cd packages/api
pnpm init

# Instalar dependencias principales
pnpm add express dotenv

# Instalar dependencias de desarrollo
pnpm add -D typescript @types/express @types/node ts-node nodemon

# Crear directorio src
mkdir src
```

**Creación de archivos base:**
- `packages/api/tsconfig.json`: Configuración estándar de TypeScript
- `packages/api/src/index.ts`: Archivo principal con servidor Express básico
- `packages/api/Dockerfile.dev`: Configuración para desarrollo con Docker

### 6. Implementación de Conexión a PostgreSQL

**Acción realizada:** Configurar conexión a la base de datos.
**Procedimiento:**
```bash
# Instalar pg y tipos
cd packages/api
pnpm add pg @types/pg
```

Código añadido en `packages/api/src/index.ts`:
```typescript
import { Pool, PoolClient } from 'pg';

// Configurar Pool de Conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Endpoint de prueba
app.get('/db-test', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error conectando o consultando la base de datos');
  } finally {
    if (client) {
      client.release();
    }
  }
});
```

### 7. Solucionando Problemas con Docker y pnpm

**Problema 1:** Error al construir el contenedor Docker debido a `node_modules`.
**Solución:**
- Creamos `.dockerignore` en la raíz con:
  ```
  node_modules
  packages/*/node_modules
  apps/*/node_modules
  ```

**Problema 2:** Error con `pnpm-lock.yaml` durante la construcción.
**Solución inicial:**
- Modificamos `docker-compose.yml` para usar la raíz como contexto.
- Actualizamos `Dockerfile.dev` para tomar en cuenta el nuevo contexto.

**Problema 3:** Error persistente con `pnpm` en Docker.
**Solución final:**
- Volvimos al contexto original (`./packages/api`)
- Modificamos `Dockerfile.dev` para usar `npm` en lugar de `pnpm`:
  ```dockerfile
  # Dockerfile.dev final
  FROM node:20-alpine
  WORKDIR /app
  COPY package.json .
  COPY tsconfig.json .
  RUN npm install
  COPY src ./src
  CMD ["npx", "nodemon", "--transpile-only", "src/index.ts"]
  ```

### 8. Verificación del Sistema

**Acción realizada:** Verificar funcionalidad del sistema.
**Procedimiento:**
```bash
# Construir y levantar contenedores
docker-compose build --no-cache
docker-compose up -d

# Verificar logs
docker logs entrepeques-api-dev
```

**Resultado:**
- Conectado a la base de datos PostgreSQL
- Prueba de query exitosa: [ { now: 2025-05-01T04:07:28.526Z } ]
- Endpoint `/db-test` funcionando correctamente

## Sesión: 01 de Mayo, 2025

### 9. Diseño e Implementación de Esquema de Base de Datos

**Acción realizada:** Crear esquema inicial y script de migración.
**Procedimiento:**
- Creamos sistema de migraciones en `packages/api/src/db.ts`
- Implementamos primera migración en `packages/api/src/migrations/001-initial-schema.sql` con:
  - Tabla `roles` (id, name, description)
  - Tabla `users` (id, role_id, username, email, password_hash, etc.)
  - Tabla `categories` (id, name, description, parent_id)
  - Tabla `products` (id, category_id, name, description, etc.)
- Creamos datos iniciales (roles básicos, usuario admin y categorías de ejemplo)

### 10. Implementación de Modelos y Servicios

**Acción realizada:** Crear interfaces de modelo y servicios CRUD.
**Procedimiento:**
- Definimos interfaces para entidades en `packages/api/src/models/index.ts`
- Implementamos servicio base genérico en `packages/api/src/services/base.service.ts` con operaciones CRUD
- Creamos servicios específicos:
  - `role.service.ts`
  - `user.service.ts`
  - `category.service.ts`
  - `product.service.ts`

### 11. Implementación del Sistema de Autenticación

**Acción realizada:** Crear sistema de autenticación con JWT.
**Procedimiento:**
- Instalamos dependencias necesarias:
  ```bash
  pnpm add jsonwebtoken bcrypt
  pnpm add -D @types/jsonwebtoken @types/bcrypt
  ```
- Implementamos utilidades para JWT en `packages/api/src/utils/jwt.util.ts`:
  - Función para generar tokens
  - Función para verificar tokens
  - Función para extraer token del encabezado
- Creamos servicio de autenticación en `packages/api/src/services/auth.service.ts`:
  - Método para registrar usuarios
  - Método para autenticar e iniciar sesión
- Implementamos middleware para proteger rutas en `packages/api/src/utils/auth.middleware.ts`:
  - Middleware de verificación de token
  - Middleware de autorización basado en roles

### 12. Implementación de Controladores y Rutas

**Acción realizada:** Crear controladores y definir rutas para autenticación.
**Procedimiento:**
- Implementamos controlador de autenticación en `packages/api/src/controllers/auth.controller.ts`:
  - Método para registro
  - Método para login
  - Método para obtener información del usuario actual
- Definimos rutas de autenticación en `packages/api/src/routes/auth.routes.ts`:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - GET `/api/auth/me` (protegida)
  - GET `/api/auth/admin` (protegida con rol admin)
- Integramos las rutas en la aplicación principal `packages/api/src/index.ts`
- Añadimos manejo de errores centralizado

### 13. Solucionando Problemas de Tipado

**Acción realizada:** Resolver errores de tipado en Express con TypeScript.
**Procedimiento:**
- Creamos definición personalizada para extender la interfaz Request en `packages/api/src/interfaces/express.d.ts`
- Ajustamos `tsconfig.json` para ser menos estricto con `noImplicitAny`
- Usamos `@ts-expect-error` en las rutas problemáticas

### 14. Verificación Final del Sistema de Autenticación

**Acción realizada:** Comprobar funcionamiento del sistema de autenticación.
**Procedimiento:**
- Reconstruimos los contenedores Docker después de resolver problemas con bcrypt:
  ```bash
  docker-compose build --no-cache api
  docker-compose up -d
  ```
- Verificamos que el servidor arranca correctamente con las rutas de autenticación disponibles

## Sesión: 02 de Mayo, 2025

### 15. Implementación de Controladores y Rutas CRUD para Categorías y Productos

**Acción realizada:** Crear controladores y rutas para gestionar categorías y productos.
**Procedimiento:**
- Implementamos controlador de categorías en `packages/api/src/controllers/category.controller.ts`:
  - Método para obtener todas las categorías
  - Método para obtener una categoría por ID
  - Método para crear categorías nuevas
  - Método para actualizar categorías existentes
  - Método para eliminar categorías (soft delete)
- Implementamos controlador de productos en `packages/api/src/controllers/product.controller.ts`:
  - Métodos CRUD estándar (getAll, getById, create, update, delete)
  - Método adicional para obtener productos por categoría
- Extendimos el servicio de productos con método para buscar por categoría
- Creamos rutas para categorías en `packages/api/src/routes/category.routes.ts`:
  - Rutas públicas (GET) para consultar categorías
  - Rutas protegidas (POST, PUT, DELETE) que requieren autenticación y roles específicos
- Creamos rutas para productos en `packages/api/src/routes/product.routes.ts`:
  - Rutas públicas y protegidas, siguiendo la misma estructura que las categorías
  - Ruta adicional para obtener productos por categoría
- Integramos estas rutas en el archivo principal `packages/api/src/routes/index.ts`
- Implementamos protección por roles para evitar modificaciones no autorizadas:
  - Admin y manager pueden crear/modificar categorías y productos
  - Solo admin puede eliminar categorías y productos

### 16. Configuración de Linters y Formateadores

**Acción realizada:** Configurar ESLint y Prettier para garantizar la calidad del código.
**Procedimiento:**
- Instalamos las dependencias necesarias:
  ```bash
  pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
  ```
- Creamos archivo `.eslintrc.js` con configuración para TypeScript
- Creamos archivo `.prettierrc` con preferencias de formato

### 17. Preparación para Despliegue en Heroku

**Acción realizada:** Configurar el proyecto para despliegue en Heroku.
**Procedimiento:**
- Creamos `Procfile` con el comando para iniciar la aplicación en producción
- Actualizamos `package.json` con:
  - Scripts para compilación y ejecución en producción
  - Postinstall hook para compilación automática
  - Especificación de motores compatibles
- Creamos archivo `app.json` con configuración para Heroku
- Implementamos configuración centralizada:
  - Creamos `src/config.ts` para gestionar variables de entorno
  - Actualizamos archivos principales para usar la configuración centralizada
  - Agregamos soporte para SSl en producción
- Creamos documentación con guía detallada de despliegue (`HEROKU_DEPLOYMENT.md`)

## Sesión: 5 de Mayo, 2025

### 18. Actualización del Plan de Frontend

**Acción realizada:** Actualización del plan de modernización con detalles específicos sobre el frontend.
**Procedimiento:**
- Añadimos detalles de implementación de Tailwind CSS 4.1 al plan de modernización
- Documentamos el enfoque de sistema de temas y modo oscuro
- Definimos la estrategia para optimización de imágenes con Astro

**Decisiones técnicas:**
- Uso de Tailwind CSS 4.1 con su nuevo plugin de Vite y sintaxis `@import "tailwindcss"`
- Implementación de variables de tema usando `@theme` de Tailwind
- Diseño del modo oscuro nativo mediante `color-scheme` y selectores `.dark` 
- Optimización de imágenes utilizando el componente `<Image />` de Astro

**Recursos identificados:**
- Documentación disponible en la carpeta `identidad/` con:
  - Guía completa de identidad visual (colores, tipografías, logo)
  - Documentación preliminar de temas en Tailwind
  - Fuentes corporativas (Poppins, Muli, Fredoka One)

## Sesión: 8 de Mayo, 2025

### 19. Implementación de Tailwind CSS 4.1 en Astro

**Acción realizada:** Configurar Tailwind CSS 4.1 en la aplicación de Valuador.
**Procedimiento:**
- Verificamos la existencia de un proyecto Astro base en `apps/valuador`
- Instalamos y configuramos Tailwind CSS 4.1 usando el plugin de Vite:
  ```bash
  cd apps/valuador
  npm install @tailwindcss/vite
  ```
- Configuramos el plugin de Tailwind en `astro.config.mjs`:
  ```javascript
  import tailwindcss from '@tailwindcss/vite';
  
  // En la configuración de Vite
  vite: {
    plugins: [tailwindcss()]
  }
  ```
- Creamos archivo de estilos globales `src/styles/global.css` con:
  - Importación de Tailwind usando la nueva sintaxis `@import "tailwindcss"`
  - Definición de variables de tema usando `@theme` con colores de identidad
  - Configuración de modo oscuro con `@custom-variant dark`
  - Estilos base para tipografía y elementos principales
- Creamos `tailwind.config.mjs` para extender el tema con nuestras variables personalizadas
- Actualizamos `MainLayout.astro` para:
  - Usar clases de Tailwind
  - Implementar soporte para modo oscuro
  - Incluir botón para alternar entre temas
  - Añadir script para persistir preferencia de tema
- Rediseñamos la página principal `index.astro` con estilos de Tailwind

**Decisiones técnicas:**
- Usamos un enfoque de "Design System" con variables CSS nativas para aprovechar las capacidades de Tailwind 4.1
- Implementamos un toggle de tema manual junto con detección automática de preferencias del sistema
- Mapeamos los colores de la identidad corporativa a variables CSS para usar con Tailwind
- Configuramos transiciones suaves entre los modos claro y oscuro

## Sesión: 10 de Mayo, 2025

### 20. Desarrollo de Páginas Principales del Valuador

**Acción realizada:** Creación de páginas principales y componentes reutilizables para la aplicación Valuador.
**Procedimiento:**
- Desarrollamos las siguientes páginas:
  - `/nueva-valuacion`: Formulario completo para ingresar datos de artículos a valorar
  - `/historial`: Vista de lista con historial de valuaciones previas
- Implementamos los siguientes componentes reutilizables:
  - `ImageUploader.astro`: Componente para carga y previsualización de imágenes
  - `StatusBadge.astro`: Componente para mostrar el estado de las valuaciones con códigos de color

**Decisiones técnicas:**
- Uso de datos de ejemplo para simular información de valuaciones previas
- Creación de componentes reutilizables para mejorar la mantenibilidad
- Implementación de validación de formularios tanto en el lado del cliente como del servidor
- Diseño responsivo para todas las pantallas usando Tailwind CSS
- Uso de tipado TypeScript en todos los componentes para mayor seguridad

## Sesión: 15 de Mayo, 2025

### 21. Desarrollo de Componentes para Formulario de Valuación

**Acción realizada:** Creación de componentes específicos para la captura de datos en el proceso de valuación.
**Procedimiento:**
- Desarrollamos el componente `ClienteForm.astro` para capturar la información del cliente:
  - Campos para nombre, teléfono, email e identificación
  - Soporte para clientes nuevos y existentes
  - Funcionalidad de búsqueda de clientes (simulada)
- Desarrollamos el componente `ProductoForm.astro` para la información de productos:
  - Selección de categoría y subcategoría
  - Datos de marca, estado y características
  - Cálculo de valoración basado en fórmulas predefinidas
  - Carga de imágenes del producto
  - Visualización del resultado de la valuación
- Integramos la lógica de negocio para el cálculo de precios:
  - Implementación de la fórmula de cálculo basada en calificaciones
  - Soporte para diferentes modalidades (compra directa, consignación)
  - Visualización del precio de compra y venta

**Decisiones técnicas:**
- Uso de componentes interactivos con JavaScript cliente para mejorar la usabilidad
- Implementación de lógica de cálculo de precios en el cliente para retroalimentación inmediata
- Diseño modular que permitirá conectar fácilmente con APIs en el futuro
- Uso de valores predefinidos para simulación (categorías, subcategorías, etc.)
- Implementación de validaciones en tiempo real

## Sesión: 20 de Mayo, 2025

### 22. Implementación de Flujo Completo de Valuación

**Acción realizada:** Creación del flujo completo de valuación desde la captura de datos hasta el resumen final.
**Procedimiento:**
- Rediseñamos la página `nueva-valuacion.astro` para integrar los componentes:
  - Sección de datos del cliente usando ClienteForm
  - Soporte para múltiples productos usando ProductoForm
  - Funcionalidad para agregar o eliminar productos
  - Generación de resumen de valuación
- Creamos el componente `ValuacionResumen.astro` para mostrar el resumen de la valuación:
  - Visualización de datos del cliente
  - Tabla con productos valuados y sus precios
  - Totales de compra y venta
  - Preparación para impresión
- Desarrollamos la página `detalle-valuacion/[id].astro` para ver valuaciones completas:
  - Visualización de todos los detalles
  - Historial de cambios
  - Acciones como imprimir, editar, etc.
- Mejoramos la página `historial.astro` para listar valuaciones anteriores:
  - Tabla con datos principales
  - Filtros de búsqueda por cliente, fecha y estado
  - Estadísticas resumidas
  - Acciones para cada valuación

**Decisiones técnicas:**
- Implementación de rutas dinámicas en Astro para detalles de valuación
- Uso de TypeScript para las interfaces de datos y validación
- Diseño de UI coherente con la identidad visual de la empresa
- Optimización para dispositivos móviles y tablets
- Configuración especial de estilos para impresión de valuaciones
- Simulación de datos hasta que se implemente la conexión con el backend

## Esquema de Base de Datos Actual

### Tablas principales
```
roles
  id SERIAL PRIMARY KEY
  name VARCHAR(50) NOT NULL UNIQUE
  description TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

users
  id SERIAL PRIMARY KEY
  role_id INTEGER REFERENCES roles(id)
  username VARCHAR(50) NOT NULL UNIQUE
  email VARCHAR(100) NOT NULL UNIQUE
  password_hash VARCHAR(100) NOT NULL
  first_name VARCHAR(50)
  last_name VARCHAR(50)
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

categories
  id SERIAL PRIMARY KEY
  name VARCHAR(100) NOT NULL
  description TEXT
  parent_id INTEGER REFERENCES categories(id)
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

products
  id SERIAL PRIMARY KEY
  category_id INTEGER REFERENCES categories(id)
  name VARCHAR(100) NOT NULL
  description TEXT
  brand VARCHAR(100)
  model VARCHAR(100)
  age_range VARCHAR(50)
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
```

### Tablas para el Sistema de Valuación (Planificadas)

```
clients
  id SERIAL PRIMARY KEY
  name VARCHAR(100) NOT NULL
  phone VARCHAR(20) NOT NULL
  email VARCHAR(100)
  identification VARCHAR(100)
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

valuations
  id SERIAL PRIMARY KEY
  client_id INTEGER REFERENCES clients(id)
  user_id INTEGER REFERENCES users(id)
  valuation_date TIMESTAMP DEFAULT NOW()
  status VARCHAR(20) DEFAULT 'pending'
  notes TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

valuation_items
  id SERIAL PRIMARY KEY
  valuation_id INTEGER REFERENCES valuations(id)
  product_id INTEGER REFERENCES products(id)
  category_id INTEGER REFERENCES categories(id)
  status VARCHAR(50) NOT NULL
  brand VARCHAR(100)
  renown VARCHAR(50)
  modality VARCHAR(50) NOT NULL
  condition_state VARCHAR(50) NOT NULL
  demand VARCHAR(50) NOT NULL
  cleanliness VARCHAR(50) NOT NULL
  features JSONB
  new_price DECIMAL(10,2)
  purchase_price DECIMAL(10,2)
  sale_price DECIMAL(10,2)
  consignment_price DECIMAL(10,2)
  notes TEXT
  images JSONB
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
```

## Estado Actual (Mayo 20, 2025)

### Completado
- ✅ Monorepo configurado con pnpm workspaces
- ✅ Docker y Docker Compose configurados y funcionando
- ✅ API básica implementada con Express/TypeScript
- ✅ Conexión a PostgreSQL establecida y verificada
- ✅ Esquema de base de datos implementado con sistema de migraciones
- ✅ Modelos y servicios CRUD implementados
- ✅ Sistema de autenticación JWT implementado
- ✅ Controladores y rutas para autenticación, categorías y productos
- ✅ Configuración de Tailwind CSS 4.1 con tema personalizado
- ✅ Aplicación Valuador con diseño responsivo y modo oscuro
- ✅ Componentes reutilizables para formularios de valuación
- ✅ Implementación del proceso completo de valuación (frontend)
- ✅ Páginas de historial y detalle de valuaciones

### En Progreso
- 🔄 Conexión del frontend con las APIs del backend
- 🔄 Sistema de gestión de imágenes para productos
- 🔄 Implementación del sistema de impresión de recibos
- 🔄 Configuración de autenticación en el frontend

### Próximos Pasos
La **Fase 2** está casi completada. El frontend del valuador está implementado con datos simulados.
Los próximos pasos incluyen:

1. **Completar la conexión del frontend con el backend:**
   - Implementar servicios en el frontend para comunicarse con la API
   - Reemplazar datos de prueba con datos reales del backend
   - Configurar manejo de autenticación y tokens

2. **Comenzar con la Fase 3: Gestión de Inventario**
   - Diseñar el esquema de base de datos para inventario
   - Implementar APIs para gestión de inventario
   - Desarrollar el panel de administración para inventario 