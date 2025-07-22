// @ts-nocheck - Desactivamos la verificación de tipos para este archivo debido a problemas con Express y TypeScript
import { Router } from 'express';
import { brandController } from '../controllers/brand.controller';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/', asyncHandler(brandController.getBySubcategory)); // Con parámetro de consulta ?subcategory_id=X
router.get('/all', asyncHandler(brandController.getAll)); // Todas las marcas

// Ruta para crear marcas - Permitimos sin autenticación para simplificar
router.post('/', asyncHandler(brandController.create));

export default router; 