# Guía de Despliegue en Heroku

Este documento describe los pasos para desplegar la API de Entrepeques en Heroku.

## Prerrequisitos

1. Cuenta en [Heroku](https://heroku.com)
2. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) instalado
3. Git instalado y configurado

## Pasos para el Despliegue

### 1. Iniciar sesión en Heroku CLI

```bash
heroku login
```

### 2. Crear una aplicación Heroku

```bash
# Desde el directorio raíz del proyecto
cd packages/api
heroku create entrepeques-api
```

### 3. Configurar Add-ons y Variables de Entorno

```bash
# Añadir base de datos PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variable de entorno JWT_SECRET
heroku config:set JWT_SECRET=tu_clave_secreta_muy_segura

# Configurar NODE_ENV
heroku config:set NODE_ENV=production
```

### 4. Desplegar la Aplicación

#### Opción 1: Despliegue desde Subdirectorio

Para desplegar una aplicación que está en un subdirectorio de un monorepo:

```bash
# Configurar Git para desplegar solo el subdirectorio
git subtree push --prefix packages/api heroku main
```

#### Opción 2: Despliegue desde GitHub

También puedes conectar tu repositorio GitHub a Heroku y habilitar despliegues automáticos.

1. Ve al [Dashboard de Heroku](https://dashboard.heroku.com)
2. Selecciona tu aplicación
3. Ve a la pestaña "Deploy"
4. Selecciona "GitHub" como método de despliegue
5. Conecta tu repositorio
6. Habilita despliegues automáticos (opcional)
7. Selecciona la rama a desplegar

### 5. Verificar el Despliegue

```bash
# Abrir la aplicación en el navegador
heroku open

# Ver logs
heroku logs --tail
```

## Solución de Problemas

Si encuentras problemas durante el despliegue:

1. **Error de compilación TypeScript**: Asegúrate de que todas las dependencias de desarrollo necesarias para la compilación estén en el objeto `dependencies` (no solo en `devDependencies`).

2. **Error de conexión a base de datos**: Verifica la URL de conexión con:
   ```bash
   heroku config:get DATABASE_URL
   ```

3. **Migraciones no ejecutadas**: Puedes forzar una nueva ejecución con:
   ```bash
   heroku run npm run build
   heroku restart
   ```

4. **Ver registros detallados**:
   ```bash
   heroku logs --tail
   ```

## Actualizaciones Posteriores

Para actualizar la aplicación después de cambios:

```bash
# Si estás utilizando subtree
git subtree push --prefix packages/api heroku main

# O si prefieres un comando más corto, puedes crear un alias
git push heroku `git subtree split --prefix packages/api main`:main --force
``` 