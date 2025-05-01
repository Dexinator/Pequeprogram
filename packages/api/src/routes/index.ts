import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de categorías
router.use('/categories', categoryRoutes);

// Rutas de productos
router.use('/products', productRoutes);

// Aquí se pueden agregar otras rutas de la API
// router.use('/users', userRoutes);

export default router; 