import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  createLayaway,
  addPayment,
  cancelLayaway,
  getLayaways,
  getLayaway,
  getLayawayStats
} from '../controllers/layaway.controller';

const router = express.Router();

router.use(protect);

const staffRoles = ['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor'];

// /stats antes de /:id para que esa ruta no lo capture
router.route('/stats').get(authorize(staffRoles), getLayawayStats);

router
  .route('/')
  .get(authorize(staffRoles), getLayaways)
  .post(authorize(staffRoles), createLayaway);

router.route('/:id').get(authorize(staffRoles), getLayaway);
router.route('/:id/payments').post(authorize(staffRoles), addPayment);
// Cancelar devuelve dinero o crédito: se restringe a gerencia
router.route('/:id/cancel').post(authorize(['superadmin', 'admin', 'manager', 'gerente']), cancelLayaway);

export default router;
