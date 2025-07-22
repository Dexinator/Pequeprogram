/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Variables de entorno públicas accesibles desde el frontend
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}