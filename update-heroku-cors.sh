#!/bin/bash

# Script para actualizar la configuración CORS en Heroku
# Nota: Ejecutar este script desde Windows con Git Bash o WSL

echo "Actualizando configuración CORS en Heroku..."

# Lista de orígenes permitidos en producción
CORS_ORIGINS="https://valuador-entrepeques.vercel.app,https://admin-entrepeques.vercel.app,https://tienda-entrepeques.vercel.app,https://pos-entrepeques.vercel.app,https://valuador.entrepeques.com,https://admin.entrepeques.com,https://tienda.entrepeques.com,https://pos.entrepeques.com,https://entrepeques.com,https://www.entrepeques.com"

echo "Configurando CORS_ORIGIN con los siguientes orígenes:"
echo $CORS_ORIGINS

# Comando para actualizar la variable en Heroku
# Descomenta la siguiente línea cuando estés listo para ejecutar
# heroku config:set CORS_ORIGIN="$CORS_ORIGINS" --app entrepeques-api

echo ""
echo "Para aplicar los cambios, ejecuta:"
echo "heroku config:set CORS_ORIGIN=\"$CORS_ORIGINS\" --app entrepeques-api"
echo ""
echo "Para verificar la configuración actual:"
echo "heroku config --app entrepeques-api"