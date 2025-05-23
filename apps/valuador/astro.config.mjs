import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Configuración para modo servidor completo
  output: 'server',
  // Base URL para subdominios
  base: '/',
  // Configuración de desarrollo
  server: {
    port: 4321,
    host: true
  },
  // Configuración de Vite con Tailwind CSS
  vite: {
    plugins: [tailwindcss()],
    // Configuración del servidor de desarrollo
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
});