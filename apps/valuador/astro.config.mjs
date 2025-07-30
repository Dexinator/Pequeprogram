import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Conditionally import vercel adapter only in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
let vercelAdapter;
if (isProduction) {
  const vercel = await import('@astrojs/vercel');
  vercelAdapter = vercel.default;
}

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Configuración para modo servidor completo
  output: 'server',
  // Configuración del adaptador de Vercel (solo en producción)
  adapter: isProduction ? vercelAdapter() : undefined,
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