import { Router } from 'express';
import { valuationController } from '../controllers/valuation.controller';
import { authMiddleware } from '../utils/auth.middleware';

const router = Router();

// Ignorar errores de tipo para Express middleware (son advertencias de TypeScript)
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/clients', authMiddleware, valuationController.createClient);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.get('/clients/search', authMiddleware, valuationController.searchClients);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.get('/clients/:id', authMiddleware, valuationController.getClient);

// Rutas para valoraciones
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/', authMiddleware, valuationController.createValuation);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.get('/', authMiddleware, valuationController.getValuations);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.get('/:id', authMiddleware, valuationController.getValuation);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/:id/items', authMiddleware, valuationController.addValuationItem);
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.put('/:id/finalize', authMiddleware, valuationController.finalizeValuation);

// Ruta para crear y finalizar valuación con todos los items de una vez
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/finalize-complete', authMiddleware, valuationController.finalizeComplete);

// Ruta para cálculo de valoración (puede ser usada sin crear una valoración completa)
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/calculate', valuationController.calculateValuation);

// Ruta para cálculo de múltiples productos sin insertar en DB
// @ts-expect-error - Express y TypeScript tienen problemas de tipos con middleware
router.post('/calculate-batch', authMiddleware, valuationController.calculateBatch);

export default router; 