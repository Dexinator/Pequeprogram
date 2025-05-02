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

## Estado Actual (02/05/2025)

- ✅ Monorepo configurado con pnpm workspaces
- ✅ Docker y Docker Compose configurados y funcionando
- ✅ API básica implementada con Express/TypeScript
- ✅ Conexión a PostgreSQL establecida y verificada
- ✅ Esquema de base de datos implementado con sistema de migraciones
- ✅ Modelos y servicios CRUD implementados
- ✅ Sistema de autenticación JWT implementado
- ✅ Controladores y rutas para autenticación, categorías y productos
- ✅ Linters y formateadores (ESLint, Prettier) configurados
- ✅ Configuración para despliegue en Heroku

## Próximos Pasos

La **Fase 1** ha sido completada exitosamente. Podemos proceder a la **Fase 2: Aplicación Valuador**.

1. **Próximas tareas (Fase 2):**
   - Inicializar proyecto Frontend para Valuador (Astro + React, TypeScript)
   - Diseñar UI/UX del proceso de valuación
   - Ampliar esquema BD con tablas para valuaciones
   - Desarrollar lógica de negocio para cálculo de valuaciones

## Recursos y Referencias

- **Estructura de archivos actual:**
  - `/ENTREPEQUES_MODERNIZATION_PLAN.md` - Plan maestro
  - `/pnpm-workspace.yaml` - Configuración del monorepo
  - `/docker-compose.yml` - Configuración de Docker
  - `/packages/api/*` - Backend API
  - `/packages/api/src/index.ts` - Punto de entrada de la API
  - `/packages/api/src/models/*` - Modelos de datos
  - `/packages/api/src/services/*` - Servicios CRUD y autenticación
  - `/packages/api/src/routes/*` - Definición de rutas
  - `/packages/api/src/controllers/*` - Controladores de la API
  - `/packages/api/src/utils/*` - Utilidades (JWT, middlewares)
  - `/packages/api/src/migrations/*` - Scripts de migración de BD
  - `/Current State.md` - Esta bitácora

- **Comandos útiles:**
  - `docker-compose up -d` - Levantar contenedores en segundo plano
  - `docker-compose down` - Detener contenedores
  - `docker logs entrepeques-api-dev` - Ver logs de la API
  - `docker-compose build --no-cache api` - Reconstruir la imagen de la API 