@echo off
REM Script para iniciar el entorno de desarrollo de Entrepeques en Windows

REM Verificar si existe el archivo .env
if not exist .env (
    echo El archivo .env no existe. Creando uno con valores predeterminados...
    
    echo # Variables de Base de Datos > .env
    echo DATABASE_USER=user >> .env
    echo DATABASE_PASSWORD=password >> .env
    echo DATABASE_NAME=entrepeques_dev >> .env
    echo. >> .env
    echo # Variables de API >> .env
    echo API_PORT=3001 >> .env
    echo JWT_SECRET=your-development-secret-key >> .env
    echo JWT_EXPIRATION=24h >> .env
    echo. >> .env
    echo # Variables de Frontend >> .env
    echo PUBLIC_API_URL=http://localhost:3001/api >> .env
    echo CORS_ORIGIN=http://localhost:4321 >> .env
    
    echo Archivo .env creado.
)

REM Iniciar servicios con Docker Compose
echo Iniciando servicios con Docker Compose...
docker-compose down
docker-compose build
docker-compose up -d

REM Esperar a que los servicios estén disponibles
timeout /t 5 /nobreak > nul

REM Abrir el navegador
echo Abriendo el frontend en el navegador...
start http://localhost:4321

echo.
echo ===================================================================
echo Entrepeques en desarrollo: 
echo ===================================================================
echo Frontend: http://localhost:4321
echo API: http://localhost:3001/api
echo Base de datos: localhost:5432
echo   - Usuario: user
echo   - Contraseña: password
echo   - Base de datos: entrepeques_dev
echo PGAdmin: http://localhost:5050
echo   - Email: admin@admin.com
echo   - Contraseña: admin
echo ===================================================================
echo Para detener los servicios: docker-compose down
echo Para ver logs: docker-compose logs -f
echo =================================================================== 