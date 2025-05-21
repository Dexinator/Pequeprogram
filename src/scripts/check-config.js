// Script para verificar la configuración del backend
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('=== Verificación de configuración del backend ===');

// Verificar variables de entorno
console.log('\n--- Variables de entorno ---');
console.log('NODE_ENV:', process.env.NODE_ENV || 'no definido');
console.log('PORT:', process.env.PORT || 'no definido');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'definido (oculto por seguridad)' : 'no definido');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'definido (oculto por seguridad)' : 'no definido');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'no definido');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'no definido');

// Verificar archivos de configuración
console.log('\n--- Archivos de configuración ---');
const configPath = path.join(__dirname, '..', 'config.ts');
console.log(`Archivo de configuración (${configPath}):`, fs.existsSync(configPath) ? 'existe' : 'no existe');

// Verificar archivos de migración
console.log('\n--- Archivos de migración ---');
const migrationsPath = path.join(__dirname, '..', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrationFiles = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.sql'));
  console.log(`Número de archivos de migración: ${migrationFiles.length}`);
  console.log('Archivos de migración:');
  migrationFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('El directorio de migraciones no existe');
}

// Verificar rutas
console.log('\n--- Archivos de rutas ---');
const routesPath = path.join(__dirname, '..', 'routes');
if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  console.log(`Número de archivos de rutas: ${routeFiles.length}`);
  console.log('Archivos de rutas:');
  routeFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('El directorio de rutas no existe');
}

// Verificar controladores
console.log('\n--- Archivos de controladores ---');
const controllersPath = path.join(__dirname, '..', 'controllers');
if (fs.existsSync(controllersPath)) {
  const controllerFiles = fs.readdirSync(controllersPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  console.log(`Número de archivos de controladores: ${controllerFiles.length}`);
  console.log('Archivos de controladores:');
  controllerFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('El directorio de controladores no existe');
}

// Verificar servicios
console.log('\n--- Archivos de servicios ---');
const servicesPath = path.join(__dirname, '..', 'services');
if (fs.existsSync(servicesPath)) {
  const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  console.log(`Número de archivos de servicios: ${serviceFiles.length}`);
  console.log('Archivos de servicios:');
  serviceFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('El directorio de servicios no existe');
}

console.log('\n=== Fin de la verificación ===');
