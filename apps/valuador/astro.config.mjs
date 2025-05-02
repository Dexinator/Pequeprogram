import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Configuración para despliegue en Vercel
  output: 'static',
  // Base URL para subdominios
  base: '/',
  // Configuración de desarrollo
  server: {
    port: 3000,
    host: true
  },
  // Configuración de Vite con Tailwind CSS
  vite: {
    plugins: [tailwindcss()]
  }
}); 