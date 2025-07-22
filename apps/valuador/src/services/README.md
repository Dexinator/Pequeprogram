# Servicios de API para Entrepeques

Este directorio contiene los servicios que conectan el frontend con el backend. Los servicios están organizados por funcionalidad y utilizan una clase base `HttpService` para hacer las peticiones.

## Estructura

- `http.service.ts`: Clase base con métodos para peticiones HTTP (GET, POST, PUT, DELETE)
- `auth.service.ts`: Servicio para autenticación de usuarios
- `valuation.service.ts`: Servicio para operaciones de valuación

## Configuración

Los servicios utilizan la variable de entorno `PUBLIC_API_URL` para determinar la URL base de la API. Esta variable debe estar definida en el archivo `.env.local` del proyecto:

```
PUBLIC_API_URL=http://localhost:3001/api
```

## Uso básico

Cada servicio puede ser importado y utilizado en componentes React:

```typescript
import { ValuationService } from '../services';

// En un componente:
const valuationService = new ValuationService();

// Ejemplo de uso:
const searchClients = async (term: string) => {
  try {
    const clients = await valuationService.searchClients(term);
    // Manejar respuesta
  } catch (error) {
    // Manejar error
  }
};
```

## Autenticación

El servicio de autenticación maneja el token JWT y el almacenamiento del usuario en localStorage. Para crear componentes que requieran autenticación, utiliza el `AuthContext`:

```tsx
import { useAuth } from '../context/AuthContext';

const ComponenteProtegido = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return (
    // Contenido protegido
  );
};
```

## Manejo de errores

Todos los servicios implementan manejo básico de errores. Se recomienda implementar manejo adicional en los componentes que utilicen estos servicios:

```typescript
try {
  const result = await valuationService.calculateValuation(data);
  // Procesar resultado
} catch (error) {
  if (error instanceof Error) {
    // Mostrar mensaje específico
    toast.error(error.message);
  } else {
    // Mensaje genérico
    toast.error('Ocurrió un error al procesar la solicitud');
  }
}
``` 