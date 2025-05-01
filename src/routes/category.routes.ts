import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', asyncHandler(categoryController.getAll));
router.get('/:id', asyncHandler(categoryController.getById));

// Rutas protegidas (requieren autenticación y rol admin/manager)
// @ts-expect-error: Ignorando error de tipado en Express
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  asyncHandler(categoryController.create)
);

// @ts-expect-error: Ignorando error de tipado en Express
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  asyncHandler(categoryController.update)
);

// @ts-expect-error: Ignorando error de tipado en Express
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), // Solo admin puede eliminar
  asyncHandler(categoryController.delete)
);

export default router; 