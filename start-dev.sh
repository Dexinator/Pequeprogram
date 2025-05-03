#!/bin/bash

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
  echo "El archivo .env no existe. Creando uno basado en valores predeterminados."
  
  cat > .env << EOL
# Variables de Base de Datos
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=entrepeques_dev

# Variables de API
API_PORT=3001
JWT_SECRET=your-development-secret-key
JWT_EXPIRATION=24h

# Variables de Frontend
PUBLIC_API_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:4321
EOL

  echo "Archivo .env creado."
fi

# Iniciar los servicios con Docker Compose
echo "Iniciando servicios con Docker Compose..."
docker-compose down
docker-compose build
docker-compose up -d

echo "Servicios iniciados. Abriendo URLs en el navegador..."

# Esperar a que los servicios estén disponibles
sleep 5

# Abrir URLs en el navegador (funciona en la mayoría de sistemas operativos)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:4321  # Linux
elif command -v open &> /dev/null; then
    open http://localhost:4321  # macOS
elif command -v start &> /dev/null; then
    start http://localhost:4321  # Windows
fi

echo "
===================================================================
Entrepeques en desarrollo: 
===================================================================
Frontend: http://localhost:4321
API: http://localhost:3001/api
Base de datos: localhost:5432
  - Usuario: $DATABASE_USER
  - Contraseña: $DATABASE_PASSWORD
  - Base de datos: $DATABASE_NAME
PGAdmin: http://localhost:5050
  - Email: admin@admin.com
  - Contraseña: admin
===================================================================
Para detener los servicios: docker-compose down
Para ver logs: docker-compose logs -f
===================================================================" 