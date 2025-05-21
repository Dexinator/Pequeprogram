import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import valuationRoutes from './valuation.routes';
import brandRoutes from './brand.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de categorías
router.use('/categories', categoryRoutes);

// Rutas de productos
router.use('/products', productRoutes);

// Rutas de valuaciones
router.use('/valuations', valuationRoutes);

// Rutas de marcas
router.use('/brands', brandRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de roles
router.use('/roles', roleRoutes);

export default router;