// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';

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
    port: 4324,
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
  },
});