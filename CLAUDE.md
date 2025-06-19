# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the complete application
```bash
# Start all services (database, API, frontend)
docker-compose up -d

# Check API health
curl http://localhost:3001/api/health

# Start frontend development server
cd apps/valuador && npm run dev
```

### Backend API Development (packages/api)
```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run linting and formatting
npm run lint
npm run format

# Run database migrations
npm run migrate

# Check TypeScript types (no emit)
npx tsc --noEmit
```

### Frontend Development (apps/valuador)
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Check Astro types
npx astro check
```

### Docker Development
```bash
# View API logs in real-time
docker logs entrepeques-api-dev -f

# Rebuild API container (after dependency changes)
docker-compose build --no-cache api

# Reset database completely
docker-compose down -v && docker-compose up -d

# Access database via pgAdmin: http://localhost:5050
# Email: admin@admin.com, Password: admin
```

## Project Context and Architecture

### Business Context
This is a modernization project for "Entrepeques" - a second-hand children's items business. The system replaces legacy applications (VB Valuator, My Business POS, WooCommerce) with a unified web platform for valuation, inventory, online store, and point-of-sale management.

### 7-Phase Implementation Plan
**Current Status: Phase 2 ✅ COMPLETED (Valuation System 100% Functional)**

1. **Phase 1** ✅ - Foundation & Core API (Backend with PostgreSQL, JWT auth, basic CRUD)
2. **Phase 2** ✅ - Valuation Application (Astro + React frontend, complete valuation workflow)
3. **Phase 3** 🔄 - Inventory Management & Admin Panel (Next to implement)
4. **Phase 4** ⏳ - Online Store (Public e-commerce frontend)
5. **Phase 5** ⏳ - Physical POS (Point of sale interface + local printer bridge)
6. **Phase 6** ⏳ - Payment Processing (PSP integration)
7. **Phase 7** ⏳ - Testing, Deployment & Migration

### Monorepo Structure
- **packages/api/**: Node.js + Express API with TypeScript, JWT authentication, PostgreSQL
- **apps/valuador/**: Astro + React frontend with TypeScript, Tailwind CSS (Phase 2 complete)
- **apps/admin/**: Admin panel (Phase 3 - not yet implemented)
- **apps/tienda/**: Public e-commerce store (Phase 4 - not yet implemented)
- **apps/pos/**: Point-of-sale interface (Phase 5 - not yet implemented)
- **data/**: CSV files and SQL inserts for seed data
- **docker-compose.yml**: Orchestrates PostgreSQL, API, frontend, and pgAdmin services

### Planned Domain Structure
- `api.entrepeques.com`: Backend API
- `valuador.entrepeques.com`: Valuation application
- `admin.entrepeques.com`: Admin panel
- `tienda.entrepeques.com`: Public online store
- `pos.entrepeques.com`: Point-of-sale interface

## API Architecture (packages/api/src/)

### Core Structure
- **controllers/**: REST endpoint handlers (auth, brands, categories, products, valuations)
- **services/**: Business logic layer with database operations
- **routes/**: Express route definitions with middleware
- **models/**: TypeScript interfaces and data models
- **migrations/**: SQL schema migration files (run with `npm run migrate`)
- **utils/**: JWT utilities and authentication middleware
- **config.ts**: Environment configuration and database connection

### Authentication System (JWT-based)
- **Registration**: `POST /api/auth/register` with role assignment
- **Login**: `POST /api/auth/login` returns JWT token (24h expiration)
- **User info**: `GET /api/auth/me` protected endpoint
- **Roles**: admin, manager, valuator, sales with middleware verification
- **Security**: bcrypt hashing (10 rounds), parameterized queries, role-based access

### API Endpoints
**Categories & Features:**
- `GET /api/categories` - All categories
- `GET /api/categories/:id/subcategories` - Subcategories by category
- `GET /api/categories/subcategories/:id/features` - All feature definitions
- `GET /api/categories/subcategories/:id/offer-features` - Features marked for offers only

**Valuations:**
- `POST /api/valuations` - Create new valuation
- `GET /api/valuations` - List valuations with filtering
- `GET /api/valuations/:id` - Get specific valuation with items
- `POST /api/valuations/calculate-batch` - Calculate multiple products
- `POST /api/valuations/finalize-complete` - Complete valuation process

**Enhanced Features:**
- All valuation endpoints return `store_credit_price` calculations
- Offer endpoints filter features using `offer_print = TRUE`
- History endpoints include quantity-based product counting

### Database Schema (PostgreSQL 16)
Complete relational schema with 12 core tables and optimized indexes:

**Core Authentication & Users:**
- **users**: User accounts with role-based access (id, username, email, password_hash, first_name, last_name, role_id, is_active)
- **roles**: User roles (admin, manager, valuator, sales) with descriptions
- **migrations**: Database schema version control

**Product Catalog Structure:**
- **categories**: Top-level product categories (id, name, description)
- **subcategories**: Product subcategories with valuation parameters (id, category_id, name, sku, gap_new, gap_used, margin_new, margin_used)
- **brands**: Product brands organized by subcategory (id, name, renown, subcategory_id)
- **products**: Basic product catalog (id, category_id, name, brand, model, age_group)

**Dynamic Product Attributes:**
- **feature_definitions**: Dynamic form fields per subcategory with offer printing control (id, subcategory_id, name, display_name, type, order_index, options JSONB, mandatory, offer_print BOOLEAN)
- **valuation_factors**: Scoring rules for valuation calculation (id, subcategory_id, factor_type, factor_value, score)

**Valuation Business Logic:**
- **clients**: Customer information (id, name, phone, email, identification) - phone is unique
- **valuations**: Main valuation sessions (id, client_id, user_id, valuation_date, total_purchase_amount, total_store_credit_amount, total_consignment_amount, status, notes)
- **valuation_items**: Individual products within valuations with complete pricing data:
  - Product classification: category_id, subcategory_id, brand_id
  - Condition assessment: status, brand_renown, modality, condition_state, demand, cleanliness
  - Dynamic attributes: features JSONB (category-specific fields)
  - Pricing: new_price, purchase_score, sale_score, suggested_purchase_price, suggested_sale_price, final_purchase_price, final_sale_price, consignment_price, store_credit_price
  - Additional: images JSONB, notes, online_store_ready

**Key Relationships:**
- users.role_id → roles.id
- subcategories.category_id → categories.id
- brands.subcategory_id → subcategories.id
- feature_definitions.subcategory_id → subcategories.id
- valuation_factors.subcategory_id → subcategories.id
- valuations.client_id → clients.id, valuations.user_id → users.id
- valuation_items.valuation_id → valuations.id, valuation_items.category_id → categories.id, valuation_items.subcategory_id → subcategories.id, valuation_items.brand_id → brands.id

**Performance Indexes:**
- idx_subcategories_category, idx_feature_definitions_subcategory, idx_valuation_factors
- idx_valuations_client, idx_valuations_date, idx_valuations_status, idx_valuations_user
- idx_valuation_items_valuation, idx_valuation_items_category, idx_valuation_items_subcategory

## Frontend Architecture (apps/valuador/src/)

### Structure
- **components/**: React components organized by feature
  - **auth/**: LoginContainer, AuthGuard, ProtectedRoute, NavBar
  - **HistorialValuaciones.jsx**: Complete valuation history with filters
  - **NuevaValuacion.jsx**: End-to-end valuation workflow
  - **ProductoForm.jsx**: Dynamic product form with category-based fields
  - **ClienteForm.jsx**: Client registration and search
- **context/**: React Context for global state (AuthContext for authentication)
- **services/**: API client services for backend communication
- **pages/**: Astro pages with file-based routing
- **types/**: TypeScript type definitions
- **styles/**: Global CSS with Tailwind configuration

### Key Features Implemented
- **Authentication**: JWT persistence, session recovery, route protection
- **Valuation Workflow**: Client → Products → Categorization → Calculation → Summary
- **History Management**: Filtering, pagination, real-time statistics
- **Dynamic Forms**: Category-based product attributes and brand selection
- **Offer Generation**: Database-driven product descriptions with print optimization
- **Payment Modalities**: Three types - direct purchase, store credit (+10%), consignment (+20%)
- **Responsive Design**: Corporate theme with Entrepeques color palette

### Business Logic - Valuation System
Multi-step valuation process:
1. Client identification (search existing or register new)
2. Product registration with dynamic attributes based on category/subcategory
3. Automatic valuation calculation using business rules with three pricing tiers
4. Summary generation with modality selection and price editing
5. Professional offer document generation with company branding
6. Complete audit trail with timestamps and user tracking

### Offer Generation System
**Database-Driven Product Descriptions:**
- Uses `feature_definitions.offer_print` field to determine which characteristics appear in offers
- 45+ important features marked for offer inclusion (modelo, tipo, talla, etc.)
- Dynamic description format: `Subcategory + Important Features + Brand + Condition`
- Optimized for print with company information and multi-page support

**Payment Modalities:**
- **Compra Directa**: Base purchase price (cash payment)
- **Crédito en Tienda**: Base price + 10% (store vouchers, non-refundable)
- **Consignación**: Base price + 20% (consignment, not included in printed offers)

**API Endpoints:**
- `GET /api/categories/subcategories/:id/offer-features` - Returns features marked for offers
- Enhanced valuation endpoints include `store_credit_price` calculations

## Design System

### Entrepeques Brand Colors
- **Pink**: `#ff6b9d` - Primary brand color
- **Yellow**: `#feca57` - Accents and alerts
- **Light Blue**: `#74b9ff` - Primary elements
- **Lime Green**: `#6c5ce7` - Success actions
- **Dark Green**: `#00b894` - Confirmations
- **Deep Blue**: `#2d3436` - Main text

### Typography
- **Headings**: Poppins (Google Fonts)
- **Body**: Inter/Muli (Google Fonts)
- **Display**: Fredoka One (Google Fonts)

### Tailwind CSS 4.1 Implementation
- Uses Vite plugin for efficient integration
- CSS variables system with `@theme` function
- Corporate theme implementation
- Responsive design patterns

## Development Workflow

### Before Starting Work
1. **Always read** `ENTREPEQUES_MODERNIZATION_PLAN.md` for project context and phase details
2. **Check** `Current_State.md` for latest development status and detailed implementation notes
3. **Update** `Current_State.md` after completing major features or milestones
4. **Ensure** Docker services are running: `docker-compose up -d`

### Code Style and Patterns
- **Backend**: ESLint + Prettier enforced, express-async-handler for errors
- **Frontend**: Astro + React + TypeScript conventions
- **Database**: Migration-based schema management, parameterized queries
- **Authentication**: JWT middleware pattern, role-based authorization
- **API**: Standardized response objects, service layer abstraction

### Testing and Validation
- **API**: Check logs with `docker logs entrepeques-api-dev -f`
- **Frontend**: Astro dev server with hot reload on port 4321
- **Database**: pgAdmin access on port 5050 for direct queries
- **Authentication**: Test users available (admin/admin123, valuador/valuador123)

### Common Issues Solved
- **Astro + React Hydration**: AuthProvider wrapper pattern for context availability
- **Currency Formatting**: `formatCurrency()` function with null/undefined validation
- **JWT Token Expiry**: Automatic cleanup and refresh mechanisms
- **Offer Printing**: Optimized CSS for multi-page printing with proper break rules
- **Product Descriptions**: Database-driven dynamic descriptions using feature flags
- **History Display**: Removed consignación column, added quantity-based counting, cash flow card

## Important Implementation Details

### Environment Configuration  
- API uses Docker environment variables for database connection
- JWT secrets and CORS origins configurable
- Frontend API URL via `PUBLIC_API_URL`
- Database connection string: `postgresql://user:password@db:5432/entrepeques_dev`

### Deployment Strategy
- **Development**: Docker Compose for local development
- **Production**: Vercel (frontend), Heroku (backend + DB)
- **API**: Heroku deployment configuration available
- **Database**: PostgreSQL migrations for schema versioning

### Data Management
- **Seed Data**: CSV files in `data/` directory with SQL import scripts
- **Migrations**: Sequential SQL files in `packages/api/src/migrations/`
  - 001-004: Core schema (users, categories, products, valuations)
  - 005: Added `offer_print` field to feature_definitions
  - 006-007: Complete feature_definitions data load (102 records from CSV)
- **Feature Definitions**: 102 complete records with offer printing flags (45 marked for offers)
- **Backup Strategy**: Docker volumes for development persistence

### Performance Considerations
- **Image Optimization**: Planned Astro native image optimization
- **Caching**: Future implementation for frequent data queries
- **Database**: Indexes on frequently queried columns
- **Frontend**: Astro SSR with React islands for optimal performance

## Required Reading Before Development
- **ENTREPEQUES_MODERNIZATION_PLAN.md**: Complete project context and 7-phase plan
- **Current_State.md**: Detailed development log and current implementation status
- **PROYECTO_STATUS_MAYO_2025.md**: Current phase status and next steps summary
- **logica_de_valuacion.md**: Business logic for valuation calculations