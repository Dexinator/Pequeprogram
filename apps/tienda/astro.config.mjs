// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";

// Conditionally import Vercel adapter only in production/Vercel environment
let adapter = undefined;
if (process.env.VERCEL) {
  const vercel = await import('@astrojs/vercel');
  adapter = vercel.default();
}

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  adapter: adapter,
  site: 'https://tienda.entrepeques.com'
});