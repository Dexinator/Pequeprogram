/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Colores de fondo y texto basados en variables tema
        background: 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        
        // Colores de marca basados en la identidad visual
        rosa: 'var(--color-rosa)',
        amarillo: 'var(--color-amarillo)',
        'azul-claro': 'var(--color-azul-claro)',
        'verde-lima': 'var(--color-verde-lima)',
        'verde-oscuro': 'var(--color-verde-oscuro)',
        'azul-profundo': 'var(--color-azul-profundo)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        heading: 'var(--font-heading)',
        playful: 'var(--font-playful)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}; 