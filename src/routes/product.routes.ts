// @ts-nocheck - Ignorar todos los errores de tipado en este archivo
import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', asyncHandler(productController.getAll));
// Importante: la ruta específica debe ir ANTES de la ruta con parámetro dinámico
router.get('/category/:categoryId', asyncHandler(productController.getByCategory));
router.get('/:id', asyncHandler(productController.getById));

// Rutas protegidas (requieren autenticación y rol admin/manager)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  // @ts-ignore: Ignorando error de tipado en Express
  asyncHandler(productController.create)
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  // @ts-ignore: Ignorando error de tipado en Express
  asyncHandler(productController.update)
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), // Solo admin puede eliminar
  // @ts-ignore: Ignorando error de tipado en Express
  asyncHandler(productController.delete)
);

export default router; 