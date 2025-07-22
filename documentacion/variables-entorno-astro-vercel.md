# Variables de Entorno en Astro con Vercel

## Problema Común

Al desplegar aplicaciones Astro en Vercel, las variables de entorno con prefijo `PUBLIC_` pueden no estar disponibles en producción, aunque funcionen correctamente en desarrollo local. El síntoma típico es que la aplicación usa valores por defecto (como `localhost`) en lugar de las URLs de producción configuradas.

## Causa Raíz

1. **Tree-shaking de Vite**: Durante el build de producción, Vite puede eliminar código que considera "no utilizado", incluyendo referencias a `import.meta.env.PUBLIC_*` si están dentro de bloques condicionales o try-catch.

2. **Reemplazo estático**: Las variables `import.meta.env` se reemplazan estáticamente durante el build, no son dinámicas en runtime.

3. **Optimización agresiva**: Si no hay una referencia directa y clara a la variable, Vite puede optimizarla y eliminarla del bundle final.

## Solución Implementada

### Para HttpService (Frontend)

```typescript
constructor(baseUrl = 'http://localhost:3001/api') {
  // IMPORTANTE: Forzar la inclusión de PUBLIC_API_URL en el bundle de producción
  // Esta línea evita que Vite elimine la variable durante el tree-shaking
  const _publicApiUrl = import.meta.env.PUBLIC_API_URL;
  
  // Intentar obtener la URL de la API desde las variables de entorno
  if (typeof window !== 'undefined') {
    try {
      // Usar la variable que ya capturamos arriba
      const envUrl = _publicApiUrl;
      if (envUrl) {
        baseUrl = envUrl;
      }
    } catch (error) {
      console.warn('Error al obtener la URL de la API desde las variables de entorno:', error);
    }
  }

  this.baseUrl = baseUrl;
}
```

### Puntos Clave:

1. **Declarar la variable fuera de bloques condicionales**: Esto fuerza a Vite a incluirla en el bundle.
2. **No usar optional chaining en la primera referencia**: `import.meta.env.PUBLIC_API_URL` directamente, no `import.meta?.env?.PUBLIC_API_URL`.
3. **Capturar en una variable antes de usar**: Esto garantiza que la referencia sea explícita.

## Configuración en Vercel

1. **Variables de entorno en Vercel Dashboard**:
   - Ir a Settings → Environment Variables
   - Agregar `PUBLIC_API_URL` con el valor correspondiente
   - Asegurarse de que esté disponible en todos los entornos (Production, Preview, Development)

2. **Ejemplo de configuración**:
   ```
   PUBLIC_API_URL = https://entrepeques-api-19a57de16883.herokuapp.com/api
   ```

## Configuración del Backend (CORS)

El backend debe permitir los orígenes de todas las aplicaciones frontend:

```typescript
// config.ts
corsOrigin: process.env.CORS_ORIGIN || [
  // Producción - Apps en Vercel
  'https://valuador-entrepeques.vercel.app',
  'https://admin-entrepeques.vercel.app',
  'https://tienda-entrepeques.vercel.app',
  'https://pos-entrepeques.vercel.app',
  // Desarrollo local
  'http://localhost:4321',
  'http://localhost:4322',
  'http://localhost:4323',
  'http://localhost:4324'
]
```

En Heroku, configurar:
```bash
heroku config:set CORS_ORIGIN="https://valuador-entrepeques.vercel.app,https://admin-entrepeques.vercel.app,https://tienda-entrepeques.vercel.app,https://pos-entrepeques.vercel.app" -a tu-app-name
```

## Debugging

Si las variables no funcionan:

1. **Agregar temporalmente un componente de debug**:
```jsx
// DebugEnv.jsx
const DebugEnv = () => {
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'black', color: 'white', padding: '10px' }}>
      PUBLIC_API_URL: {import.meta.env.PUBLIC_API_URL || 'No definida'}
    </div>
  );
};
```

2. **Verificar en la consola del navegador**:
   - Los logs del HttpService mostrarán qué URL está usando
   - Si dice "localhost", la variable no se está incluyendo en el build

3. **Forzar un rebuild en Vercel**:
   - A veces es necesario hacer un "Redeploy" desde el dashboard de Vercel
   - Esto asegura que las nuevas variables de entorno se incluyan

## Lecciones Aprendidas

1. **Siempre hacer una referencia directa** a las variables PUBLIC_ fuera de bloques condicionales
2. **No confiar solo en el desarrollo local** - el comportamiento en producción puede ser diferente
3. **El tree-shaking de Vite es agresivo** - código que parece necesario puede ser eliminado
4. **Las variables deben estar disponibles durante el build**, no solo en runtime

## Aplicaciones Afectadas

Esta solución se ha aplicado a:
- ✅ apps/valuador/src/services/http.service.ts
- ✅ apps/admin/src/services/http.service.ts
- ⏳ apps/tienda/src/services/http.service.ts (pendiente cuando se suba a producción)
- ⏳ apps/pos/src/services/http.service.ts (pendiente cuando se suba a producción)