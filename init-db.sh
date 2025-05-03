#!/bin/sh

echo "Esperando a que PostgreSQL esté listo..."
# Esperar a que PostgreSQL esté disponible
while ! nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL está listo. Ejecutando migraciones..."

# Ejecutar las migraciones
npm run migrate

echo "Migraciones completadas."

# Iniciar la aplicación
exec "$@" 