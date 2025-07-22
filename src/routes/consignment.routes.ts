import { Router } from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import { getAllConsignments, getConsignmentById, markConsignmentAsPaid, getConsignmentStats } from '../controllers/consignment.controller';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// GET /api/consignments/stats - Obtener estadísticas de consignaciones
router.get('/stats', authorize(['admin', 'manager', 'valuator', 'sales']), getConsignmentStats);

// GET /api/consignments - Obtener todos los productos en consignación
router.get('/', authorize(['admin', 'manager', 'valuator', 'sales']), getAllConsignments);

// GET /api/consignments/:id - Obtener un producto en consignación específico
router.get('/:id', authorize(['admin', 'manager', 'valuator', 'sales']), getConsignmentById);

// PUT /api/consignments/:id/paid - Marcar consignación como pagada
router.put('/:id/paid', authorize(['admin', 'manager']), markConsignmentAsPaid);

export default router;