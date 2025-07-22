# Documentación: Sistema de Temas con Tailwind CSS

## Configuración Base
```css
@import "tailwindcss";

/* Configuración del modo oscuro */
@custom-variant dark (&:where(.dark, .dark *));
```

## Sistema de Variables (@theme)
```css
@theme {
  /* Variables del tema claro (predeterminado) */
  --color-background: theme(colors.white);
  --color-background-alt: theme(colors.gray.50);
  --color-text-base: theme(colors.gray.800);
  --color-text-muted: theme(colors.gray.500);
  --color-border: theme(colors.gray.200);

  /* Colores de marca */
  --color-brand-purple: #3A1C71;
  --color-brand-blue: #0277BD;
  --color-brand-sky: #00B0FF;
  --color-brand-coral: #FF9E80;

  /* Paletas completas para cada color */
  --color-purple-deep-50: #eeeaf5;
  --color-purple-deep-100: #d5caeb;
  --color-purple-deep-200: #b9a6dc;
  --color-purple-deep-300: #9c81ce;
  --color-purple-deep-400: #8257bd;
  --color-purple-deep-500: #3A1C71;
  --color-purple-deep-600: #2F175B;
  --color-purple-deep-700: #251147;
  --color-purple-deep-800: #1C0C35;
  --color-purple-deep-900: #140825;
  --color-purple-deep-950: #0D0517;

  /* Ejemplo: variaciones completas para un color */
  --color-blue-industrial-50: #e1f2fd;
  --color-blue-industrial-100: #b8e0fa;
  /* ... y así sucesivamente para cada color ... */

  /* Colores de estado */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Tipografías */
  --font-sans: 'Roboto', system-ui, sans-serif;
  --font-heading: 'Montserrat', sans-serif;
  --font-logo: 'Montserrat Black', sans-serif;
  
  /* Pesos de fuente */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-black: 900;
}
```

## Implementación del Modo Oscuro
```css
:where(.dark, .dark *) {
  /* Colores base oscuros */
  --color-background: theme(colors.gray.950);
  --color-background-alt: theme(colors.gray.900);
  --color-text-base: theme(colors.gray.200);
  --color-text-muted: theme(colors.gray.400);
  --color-border: theme(colors.gray.700);

  /* Colores de marca oscuros */
  --color-brand-purple: var(--color-purple-deep-300);
  --color-brand-blue: var(--color-blue-industrial-400);
  --color-brand-sky: var(--color-blue-sky-400);
  --color-brand-coral: var(--color-coral-light-400);

  /* Colores de estado oscuros */
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error: #F87171;
}

/* Configuración de color-scheme */
html { color-scheme: light; }
html.dark { color-scheme: dark; }
```

## Estructura de Capas (Layers)
```css
@layer base {
  html {
    font-family: var(--font-sans);
    color-scheme: light; /* Predeterminado */
  }
  html.dark {
    color-scheme: dark;
  }
  body {
    @apply bg-background text-text-base transition-colors duration-300 ease-in-out;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: var(--font-weight-bold);
    @apply text-text-base;
  }
  h3, h4 {
    font-weight: var(--font-weight-medium);
  }
  p {
    @apply text-text-base;
  }
  a {
    @apply text-brand-blue hover:text-brand-sky transition-colors;
  }
  hr {
    @apply border-border;
  }
}

@layer utilities {
  .text-gradient {
    background: linear-gradient(90deg, var(--color-brand-purple), var(--color-brand-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }
  
  .slogan {
    font-family: 'Montserrat';
    font-weight: var(--font-weight-medium);
    font-style: italic;
    @apply text-text-muted;
  }
}
```

## Activación del Modo Oscuro
Para activar el modo oscuro, añade la clase `dark` al elemento HTML:
```javascript
// Ejemplo con JavaScript
document.documentElement.classList.toggle('dark');

// Persistir preferencia en localStorage
localStorage.setItem('theme', 'dark');

// Detectar preferencia del sistema
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}
```

## Uso de Variables en Componentes
```jsx
// Ejemplo de botón con variables de tema
<button className="bg-brand-blue text-background hover:bg-brand-sky transition-colors">
  Botón de Acción
</button>

// Ejemplo de tarjeta que respeta el modo oscuro
<div className="bg-background-alt border border-border rounded-lg p-4 shadow">
  <h3>Título de Tarjeta</h3>
  <p className="text-text-muted">Contenido secundario</p>
</div>
```

## Integración con Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'brand-purple': 'var(--color-brand-purple)',
        'brand-blue': 'var(--color-brand-blue)',
        'brand-sky': 'var(--color-brand-sky)',
        'brand-coral': 'var(--color-brand-coral)',
        // Colores de estado
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        // Paletas completas
        'purple-deep': {
          50: 'var(--color-purple-deep-50)',
          100: 'var(--color-purple-deep-100)',
          // ... resto de la paleta
        },
        // Otras paletas
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        heading: 'var(--font-heading)',
        logo: 'var(--font-logo)',
      },
    },
  },
  plugins: [],
}
``` 