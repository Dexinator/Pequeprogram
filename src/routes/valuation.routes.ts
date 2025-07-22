import { Router } from 'express';
import { valuationController } from '../controllers/valuation.controller';
import { authMiddleware } from '../utils/auth.middleware';

const router = Router();

// Ignorar errores de tipo para Express middleware (son advertencias de TypeScript)
router.post('/clients', authMiddleware, valuationController.createClient);
router.get('/clients/search', authMiddleware, valuationController.searchClients);
router.get('/clients/:id', authMiddleware, valuationController.getClient);

// Rutas para valoraciones
router.post('/', authMiddleware, valuationController.createValuation);
router.get('/', authMiddleware, valuationController.getValuations);
router.get('/:id', authMiddleware, valuationController.getValuation);
router.post('/:id/items', authMiddleware, valuationController.addValuationItem);
router.put('/:id/finalize', authMiddleware, valuationController.finalizeValuation);

// Ruta para crear y finalizar valuación con todos los items de una vez
router.post('/finalize-complete', authMiddleware, valuationController.finalizeComplete);

// Ruta para cálculo de valoración (puede ser usada sin crear una valoración completa)
router.post('/calculate', valuationController.calculateValuation);

// Ruta para cálculo de múltiples productos sin insertar en DB
router.post('/calculate-batch', authMiddleware, valuationController.calculateBatch);

export default router; 