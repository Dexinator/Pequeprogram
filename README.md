# Entrepeques - Entorno de Desarrollo Docker

Este documento explica cómo ejecutar el entorno de desarrollo Docker para el proyecto Entrepeques.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (incluido en Docker Desktop para Windows y macOS)

## Servicios configurados

1. **Base de datos PostgreSQL**
   - Puerto: 5432
   - Credenciales por defecto: user/password
   - Esquema: entrepeques_dev

2. **API Backend (Node.js/Express/TypeScript)**
   - Puerto: 3001
   - URL: http://localhost:3001/api

3. **Frontend (Astro/React)**
   - Puerto: 4321
   - URL: http://localhost:4321

4. **PGAdmin (Administración de PostgreSQL)**
   - Puerto: 5050
   - URL: http://localhost:5050
   - Credenciales por defecto: admin@admin.com/admin

## Configuración

Las variables de entorno se pueden configurar en un archivo `.env` en la raíz del proyecto. Si no existe, el script de inicio creará uno con valores predeterminados.

Variables disponibles:
- `DATABASE_USER`: Usuario de la base de datos
- `DATABASE_PASSWORD`: Contraseña de la base de datos
- `DATABASE_NAME`: Nombre de la base de datos
- `API_PORT`: Puerto para la API
- `JWT_SECRET`: Clave secreta para JWT
- `JWT_EXPIRATION`: Tiempo de expiración de tokens JWT
- `PUBLIC_API_URL`: URL pública de la API para el frontend
- `CORS_ORIGIN`: Origen permitido para CORS

## Comandos para iniciar el entorno

### En Windows:
```
.\start-dev.bat
```

### En Linux/macOS:
```
chmod +x start-dev.sh
./start-dev.sh
```

## Comandos útiles

- **Ver logs de todos los servicios**:
  ```
  docker-compose logs -f
  ```

- **Ver logs de un servicio específico**:
  ```
  docker-compose logs -f api
  docker-compose logs -f frontend
  docker-compose logs -f db
  ```

- **Detener todos los servicios**:
  ```
  docker-compose down
  ```

- **Reiniciar un servicio específico**:
  ```
  docker-compose restart api
  docker-compose restart frontend
  ```

## Acceso a la base de datos

1. Accede a PGAdmin en http://localhost:5050
2. Inicia sesión con las credenciales predeterminadas (admin@admin.com / admin)
3. Configura una nueva conexión al servidor:
   - Nombre: entrepeques_dev
   - Host: db
   - Puerto: 5432
   - Usuario: user (o el valor configurado en .env)
   - Contraseña: password (o el valor configurado en .env) 