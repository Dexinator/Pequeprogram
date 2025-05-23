# 🛍️ Entrepeques - Sistema de Gestión Integral

> Modernización completa del sistema de valuación, inventario y ventas para Entrepeques

## 🎯 Estado Actual

**✅ Fase 2 COMPLETADA** - Sistema de Valuación 100% Funcional

- 🔐 **Autenticación completa** con JWT y roles
- 📊 **Gestión de valuaciones** end-to-end  
- 👥 **Gestión de clientes** con búsqueda
- 📦 **Gestión de productos** con categorización inteligente
- 🎨 **Interfaz moderna** responsive con tema corporativo

## 🏗️ Arquitectura

```
┌─────────────────────┐    HTTP/JSON     ┌──────────────────────┐
│  Frontend Valuador  │ ──────────────>  │   Backend API        │
│  Astro + React + TS │                  │   Node.js + Express  │
│  Port: 4321         │ <────────────────│   Port: 3001         │
└─────────────────────┘                  └──────────────────────┘
                                                    │
                                                    │ PostgreSQL
                                                    ▼
                                         ┌──────────────────────┐
                                         │   Base de Datos      │
                                         │   PostgreSQL 16      │
                                         │   (Docker)           │
                                         └──────────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- Docker y Docker Compose
- pnpm (recomendado)

### 1. Clonar e instalar
```bash
git clone <repository-url>
cd pequeprogram
pnpm install
```

### 2. Iniciar servicios backend
```bash
# Iniciar PostgreSQL + API
docker-compose up -d

# Verificar que todo funciona
curl http://localhost:3001/api/health
```

### 3. Iniciar frontend
```bash
cd apps/valuador
npm run dev
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:4321
- **API**: http://localhost:3001
- **Documentación**: Ver `Current_State.md`

## 👤 Usuarios de Prueba

```bash
# Usuario administrador
Username: admin
Password: admin123

# Usuario valuador  
Username: valuador
Password: valuador123
```

## 📁 Estructura del Proyecto

```
pequeprogram/
├── packages/api/           # 🔧 Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Controladores REST
│   │   ├── middleware/     # Autenticación y roles
│   │   ├── services/       # Lógica de negocio
│   │   └── utils/          # Utilidades (JWT, passwords)
│   └── Dockerfile.dev
├── apps/valuador/          # 🎨 Frontend Valuador (Astro + React)
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Estado global (AuthContext)
│   │   ├── services/       # Comunicación con API
│   │   └── pages/          # Rutas de la aplicación
│   └── astro.config.mjs
├── docker-compose.yml      # 🐳 Orquestación de servicios
└── docs/                   # 📚 Documentación
```

## 🛠️ Stack Tecnológico

### Frontend
- **Astro 4.15** - Framework principal con SSR
- **React 18** - Componentes interactivos
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Tema corporativo** - Colores Entrepeques

### Backend  
- **Node.js 20** - Runtime de servidor
- **Express 4** - Framework web
- **TypeScript** - Tipado estático
- **JWT** - Autenticación sin estado
- **bcrypt** - Hash seguro de contraseñas

### Base de Datos
- **PostgreSQL 16** - Base de datos relacional
- **Docker** - Contenedorización
- **Migraciones** - Control de versiones del esquema

## 🔄 Funcionalidades Principales

### 🔐 Autenticación
- Login/logout con persistencia de sesión
- Roles de usuario (admin, manager, valuator, sales)
- Protección automática de rutas
- Recuperación de sesión tras recarga

### 📊 Gestión de Valuaciones
- **Historial**: Listado con filtros avanzados y paginación
- **Nueva valuación**: Flujo completo cliente → productos → cálculo → finalización
- **Estadísticas**: Métricas en tiempo real
- **Estados**: Pendiente, Finalizada, Cancelada

### 👥 Gestión de Clientes
- Búsqueda de clientes existentes
- Registro de nuevos clientes
- Validación de datos obligatorios

### 📦 Gestión de Productos
- Categorías jerárquicas (Categoría → Subcategoría)
- Marcas organizadas por subcategoría
- Características específicas dinámicas
- Cálculos automáticos de valuación

## 🧪 Comandos de Desarrollo

```bash
# Backend - Logs en tiempo real
docker logs entrepeques-api-dev -f

# Frontend - Modo desarrollo
cd apps/valuador && npm run dev

# Backend - Reconstruir contenedor
docker-compose build --no-cache api

# Base de datos - Reset completo
docker-compose down -v && docker-compose up -d

# Instalar dependencias - Monorepo
pnpm install

# TypeScript - Verificar tipos
cd packages/api && npx tsc --noEmit
cd apps/valuador && npx astro check
```

## 📊 Estado de Fases

| Fase | Estado | Descripción | Progreso |
|------|--------|-------------|----------|
| **Fase 1** | ✅ Completada | API Core + Base de Datos | 100% |
| **Fase 2** | ✅ Completada | Aplicación Valuador | 100% |
| **Fase 3** | 🔄 Siguiente | Panel de Administración | 0% |
| **Fase 4** | ⏳ Pendiente | Tienda en Línea | 0% |
| **Fase 5** | ⏳ Pendiente | Punto de Venta (POS) | 0% |
| **Fase 6** | ⏳ Pendiente | Procesamiento de Pagos | 0% |
| **Fase 7** | ⏳ Pendiente | Despliegue a Producción | 0% |

## 🎨 Tema Visual

### Paleta de Colores Entrepeques
- **Rosa**: `#ff6b9d` - Color principal de marca
- **Amarillo**: `#feca57` - Acentos y alertas
- **Azul claro**: `#74b9ff` - Elementos primarios
- **Verde lima**: `#6c5ce7` - Acciones exitosas
- **Verde oscuro**: `#00b894` - Confirmaciones
- **Azul profundo**: `#2d3436` - Texto principal

### Tipografías
- **Headings**: Poppins (Google Fonts)
- **Body**: Inter/Muli (Google Fonts)  
- **Display**: Fredoka One (Google Fonts)

## 📚 Documentación

- **`ENTREPEQUES_MODERNIZATION_PLAN.md`** - Plan maestro del proyecto
- **`Current_State.md`** - Bitácora detallada de desarrollo  
- **`PROYECTO_STATUS_MAYO_2025.md`** - Estado actual resumido
- **`packages/api/README.md`** - Documentación del backend
- **`apps/valuador/README.md`** - Documentación del frontend

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Entrepeques.

## 📞 Contacto

Para consultas sobre el desarrollo o funcionamiento del sistema, contactar al equipo de desarrollo.

---

**✨ Sistema de valuación 100% funcional y listo para producción ✨** 