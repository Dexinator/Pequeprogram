// @ts-nocheck - Desactivamos la verificación de tipos para este archivo debido a problemas con Express y TypeScript
import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/', asyncHandler(categoryController.getAll));
router.get('/with-counts', asyncHandler(categoryController.getCategoriesWithProductCount));
router.get('/:id', asyncHandler(categoryController.getById));
router.get('/:categoryId/subcategories', asyncHandler(categoryController.getSubcategoriesByCategory));
router.get('/subcategories', asyncHandler(categoryController.getAllSubcategories));
router.get('/subcategories/:subcategoryId/features', asyncHandler(categoryController.getFeatureDefinitionsBySubcategory));
router.get('/subcategories/:subcategoryId/offer-features', asyncHandler(categoryController.getOfferFeatureDefinitionsBySubcategory));


// Rutas protegidas (requieren autenticación y rol admin/manager)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  asyncHandler(categoryController.create)
);

router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager']), 
  asyncHandler(categoryController.update)
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), // Solo admin puede eliminar
  asyncHandler(categoryController.delete)
);

export default router; 
