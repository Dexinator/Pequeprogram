# Troubleshooting - App Tienda

## Problemas Comunes y Soluciones

### 1. Componentes React no cargan datos de API en Astro

**Problema**: Los componentes React que hacen fetch a APIs no cargan datos cuando se usan con Astro, aunque la API funciona correctamente.

**Síntomas**:
- El componente muestra el estado de "loading" pero nunca carga los datos
- En los logs del servidor aparecen errores como "No se pudo obtener el usuario (no estamos en un navegador)"
- El `useEffect` parece no ejecutarse

**Causa raíz**:
- Cuando se usa `client:load`, Astro intenta renderizar el componente en el servidor primero
- Si el componente o sus providers (como `AuthProvider`) intentan acceder a APIs del navegador (`localStorage`, `window`, etc.) durante el renderizado del servidor, fallan
- El `PageWrapper` incluye `AuthProvider` que intenta verificar autenticación usando `localStorage`

**Solución**:

1. **Para componentes públicos que no necesitan autenticación**:
   - NO usar `PageWrapper` que incluye `AuthProvider`
   - Usar el componente directamente con `client:only="react"`
   
   ```astro
   <!-- ❌ MALO - PageWrapper incluye AuthProvider que falla en SSR -->
   <PageWrapper client:load>
     <Categories />
   </PageWrapper>
   
   <!-- ✅ BUENO - Componente directo sin providers problemáticos -->
   <Categories client:only="react" />
   ```

2. **Diferencias entre directivas client**:
   - `client:load`: Renderiza en servidor Y cliente (puede causar problemas con APIs del navegador)
   - `client:only="react"`: Solo renderiza en el cliente (más seguro para componentes con browser APIs)

3. **Para debugging**:
   - Revisar logs del contenedor: `docker logs entrepeques-tienda-dev --tail 100`
   - Agregar console.logs en useEffect para verificar que se ejecuta
   - Verificar que la API responde correctamente: `curl http://localhost:3001/api/[endpoint]`

### 2. Clases dinámicas de Tailwind no funcionan

**Problema**: Las clases de Tailwind generadas dinámicamente no aplican estilos.

**Ejemplo problemático**:
```jsx
// ❌ MALO - Tailwind no puede detectar estas clases
const color = 'azul';
<div className={`bg-brand-${color}`}>
```

**Solución**:
```jsx
// ✅ BUENO - Usar clases completas
const colorClasses = {
  'A pasear': 'bg-brand-rosa hover:bg-brand-rosa/30',
  'A dormir': 'bg-brand-azul hover:bg-brand-azul/30',
};
<div className={colorClasses[category.name]}>
```

### 3. Estructura de respuesta de API

**Problema**: La API devuelve datos en formato `{ success: true, data: [...] }` pero el componente espera un array directo.

**Solución**:
```javascript
// En el servicio API
async getCategories() {
  const response = await fetchApi('/categories');
  return response.data || []; // Extraer el array de datos
}
```

## Mejores Prácticas para Evitar Estos Problemas

1. **Componentes públicos vs privados**:
   - Páginas públicas (home, productos): Evitar `AuthProvider` o hacer que sea opcional
   - Páginas privadas (cuenta, admin): Usar `AuthProvider` con `client:only`

2. **Verificación de entorno**:
   ```javascript
   if (typeof window !== 'undefined') {
     // Código que usa APIs del navegador
   }
   ```

3. **Estructura de proyecto recomendada**:
   ```
   components/
     shop/
       Categories.jsx          # Componente sin auth
       CategoriesWithAuth.jsx  # Versión con auth si se necesita
     wrappers/
       PublicWrapper.jsx       # Solo CartProvider, sin AuthProvider
       PrivateWrapper.jsx      # AuthProvider + CartProvider
   ```

4. **Testing local**:
   - Siempre verificar que la API responde: `curl http://localhost:3001/api/[endpoint]`
   - Revisar logs del contenedor para errores de SSR
   - Usar la consola del navegador para debugging de cliente

## Referencias

- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Tailwind Dynamic Classes](https://tailwindcss.com/docs/content-configuration#dynamic-class-names)