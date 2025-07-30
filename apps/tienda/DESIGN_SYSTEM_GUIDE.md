# Guía del Sistema de Diseño - Entrepeques Tienda

## 📋 Tabla de Contenidos
1. [Sistema de Colores](#sistema-de-colores)
2. [Tipografía](#tipografía)
3. [Implementación de Modo Oscuro](#implementación-de-modo-oscuro)
4. [Componentes UI](#componentes-ui)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)

## 🎨 Sistema de Colores

### Colores Primarios (80% de uso)
```css
/* Azul Claro - Principal */
--color-brand-azul: rgb(0, 160, 221);  /* Pantone 299 C */
/* Uso: Fondos principales, botones CTA, títulos importantes */

/* Verde Lima - Ecológico */
--color-brand-verde-lima: rgb(63, 174, 73);  /* Pantone 361 C */
/* Uso: Elementos ecológicos, íconos de reciclaje, acentos positivos */
```

### Colores Secundarios (15% de uso)
```css
/* Rosa Brillante - Lúdico */
--color-brand-rosa: rgb(227, 35, 143);  /* Pantone 225 C */
/* Uso: Títulos display, elementos infantiles, promociones */

/* Amarillo - Alegre */
--color-brand-amarillo: rgb(225, 213, 30);  /* Pantone 115 C */
/* Uso: Badges, alertas positivas, íconos de sol/estrella */
```

### Colores de Apoyo (5% de uso)
```css
/* Verde Oscuro */
--color-brand-verde-oscuro: rgb(0, 121, 64);  /* Pantone 356 C */

/* Azul Profundo */
--color-brand-azul-profundo: rgb(0, 112, 185);  /* Pantone 285 C */
/* Uso: Estados hover, énfasis, bordes */
```

### Colores Neutros
```css
/* Usar la escala de grises nativa de Tailwind */
gray-50 hasta gray-950
/* IMPORTANTE: No usar 'neutral', usar 'gray' para compatibilidad con dark mode */
```

## 📝 Tipografía

### Configuración de Fuentes
```css
/* En global.css */
@theme {
  --font-family-display: 'Fredoka One', system-ui, sans-serif;
  --font-family-heading: 'Poppins', system-ui, sans-serif;
  --font-family-body: 'Muli', Inter, system-ui, sans-serif;
}
```

### Uso de Tipografías
- **Display (Fredoka One)**: Títulos principales, logo, elementos lúdicos
  ```html
  <h1 class="font-display text-6xl text-brand-rosa">Entrepeques</h1>
  ```

- **Headings (Poppins)**: Subtítulos, encabezados de sección
  ```html
  <h2 class="font-heading text-3xl font-bold text-brand-azul">Sección</h2>
  ```

- **Body (Muli/Inter)**: Párrafos, texto general
  ```html
  <p class="font-body text-lg text-gray-700 dark:text-gray-300">Texto...</p>
  ```

## 🌓 Implementación de Modo Oscuro

### 1. Configuración en Tailwind CSS v4
```css
/* En global.css - AL INICIO del archivo */
@import "tailwindcss";

/* Configuración de dark mode */
@custom-variant dark (&:where(.dark, .dark *));
```

### 2. Script de Inicialización (Layout.astro)
```html
<!-- En el <head> del Layout -->
<script is:inline>
  // Aplicar dark mode ANTES de renderizar
  if (localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
       window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
</script>
```

### 3. Toggle de Dark Mode
```javascript
// Función para cambiar el tema
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}
```

### 4. Clases de Dark Mode
```html
<!-- Siempre usar gray en lugar de neutral -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-gray-100">Texto</p>
</div>

<!-- Para componentes con bg-white hardcodeado -->
<nav class="bg-white dark:bg-gray-900 transition-colors">
```

## 🧩 Componentes UI

### Botones Principales
```html
<!-- Botón Primario -->
<button class="px-6 py-3 bg-brand-azul hover:bg-brand-azul-profundo text-white 
               font-semibold rounded-lg transition-colors shadow-md">
  Acción Principal
</button>

<!-- Botón Secundario -->
<button class="px-6 py-3 bg-brand-verde-lima hover:bg-brand-verde-oscuro 
               text-white font-semibold rounded-lg transition-colors shadow-md">
  Acción Secundaria
</button>

<!-- Botón Acento -->
<button class="px-6 py-3 bg-brand-rosa hover:bg-brand-rosa-dark text-white 
               font-semibold rounded-lg transition-colors shadow-md">
  Promoción
</button>
```

### Tarjetas (Cards)
```html
<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg 
            hover:shadow-2xl transition-all transform hover:-translate-y-1">
  <h3 class="font-heading text-xl font-bold text-brand-azul mb-2">
    Título
  </h3>
  <p class="font-body text-gray-600 dark:text-gray-400">
    Descripción
  </p>
</div>
```

### Badges
```html
<span class="px-3 py-1 bg-brand-amarillo text-gray-900 rounded-full 
             text-sm font-semibold">
  Nuevo
</span>
```

### Secciones con Gradientes
```html
<section class="bg-gradient-to-br from-brand-azul/10 to-brand-verde-lima/10 
                dark:from-brand-azul/5 dark:to-brand-verde-lima/5 
                rounded-3xl p-8">
  <!-- Contenido -->
</section>
```

## ✅ Mejores Prácticas

### 1. Jerarquía de Colores
- **80%**: Colores primarios (azul, verde lima) para elementos principales
- **15%**: Colores secundarios (rosa, amarillo) para acentos y CTAs
- **5%**: Colores de apoyo para detalles y estados hover

### 2. Espaciado y Bordes
- Usar bordes redondeados: `rounded-lg`, `rounded-xl`, `rounded-2xl`
- Espaciado generoso: `p-6`, `p-8` para contenedores
- Sombras para profundidad: `shadow-md`, `shadow-lg`, `shadow-xl`

### 3. Transiciones
- Siempre agregar `transition-colors` o `transition-all` a elementos interactivos
- Usar `transform hover:scale-105` o `hover:-translate-y-1` para feedback visual

### 4. Iconos y Emojis
- Usar emojis en badges y títulos para agregar personalidad
- Mantener consistencia en el estilo de iconos

## 🔧 Problemas Comunes y Soluciones

### Problema 1: Dark Mode No Funciona
**Síntoma**: Los fondos no cambian al activar dark mode

**Solución**:
1. Verificar que `@custom-variant dark` esté en global.css
2. Usar `gray` en lugar de `neutral` para colores
3. Asegurar que el script de inicialización esté en el `<head>`
4. Revisar componentes React con `bg-white` hardcodeado

### Problema 2: NavBar No Cambia de Color
**Síntoma**: El NavBar mantiene fondo blanco en dark mode

**Solución**:
```jsx
// En NavBar.jsx
<nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors">
```

### Problema 3: Colores Custom No Funcionan
**Síntoma**: Las clases como `bg-brand-azul` no aplican

**Solución**:
Verificar que los colores estén definidos en el `@theme` y las utilidades en `@layer utilities`

### Problema 4: Flash de Contenido Sin Estilo (FOUC)
**Síntoma**: La página parpadea al cargar con dark mode

**Solución**:
El script de dark mode DEBE estar en el `<head>` y ser `is:inline`

## 📱 Consideraciones Responsive

### Tamaños de Texto Responsive
```html
<!-- Título principal -->
<h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl">

<!-- Subtítulos -->
<h2 class="text-2xl md:text-3xl lg:text-4xl">

<!-- Párrafos -->
<p class="text-base md:text-lg lg:text-xl">
```

### Grid Responsive
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>
```

## 🚀 Animaciones

### Animación Flotante (para elementos destacados)
```css
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### Uso en Componentes
```html
<h1 class="font-display text-6xl text-brand-rosa animate-float">
  Entrepeques
</h1>
```

## 📌 Checklist de Implementación

Al crear nuevas páginas o componentes:

- [ ] Importar fuentes correctas (Fredoka One, Poppins, Muli)
- [ ] Usar escala de `gray` (no `neutral`) para compatibilidad dark mode
- [ ] Agregar `transition-colors` a elementos que cambien color
- [ ] Aplicar proporción 80-15-5 en uso de colores
- [ ] Incluir estados hover con colores más oscuros
- [ ] Probar dark mode toggle
- [ ] Verificar responsividad en móvil
- [ ] Usar bordes redondeados y sombras para consistencia
- [ ] Mantener espaciado generoso (mínimo p-4, preferible p-6 o p-8)

## 🔗 Referencias

- Página Showroom: `/showroom` - Referencia visual completa
- Colores en CSS: `src/styles/global.css`
- Componentes ejemplo: `src/pages/showroom.astro`

---

**Nota**: Este sistema de diseño está optimizado para transmitir los valores de Entrepeques: ecológico, económico, infantil y alegre. Mantener consistencia en su aplicación es clave para una experiencia de usuario coherente.