import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import valuationRoutes from './valuation.routes';
import brandRoutes from './brand.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import salesRoutes from './sales.routes';
import inventoryRoutes from './inventory.routes';
import consignmentRoutes from './consignment.routes';
import clientRoutes from './client.routes';
import otherprodsRoutes from './otherprods.routes';

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

// Rutas de ventas
router.use('/sales', salesRoutes);

// Rutas de inventario
router.use('/inventory', inventoryRoutes);

// Rutas de consignaciones
router.use('/consignments', consignmentRoutes);

// Rutas de clientes
router.use('/clients', clientRoutes);

// Rutas de otros productos (compras)
router.use('/otherprods', otherprodsRoutes);

export default router;