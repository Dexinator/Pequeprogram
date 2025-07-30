// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";

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
  output: 'server',
  adapter: isProduction ? vercelAdapter() : undefined,
  base: '/',
  server: {
    port: 4322,
    host: true
  },
  vite: {
    plugins: [tailwindcss()],
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