import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  getSaleForReturn,
  createReturn,
  getReturns,
  getReturn,
  getReturnsStats
} from '../controllers/returns.controller';

const router = express.Router();

router.use(protect);

const staffRoles = ['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor'];

// /stats y /sale/:saleId van ANTES de /:id para que no los capture esa ruta
router.route('/stats').get(authorize(staffRoles), getReturnsStats);
router.route('/sale/:saleId').get(authorize(staffRoles), getSaleForReturn);

router
  .route('/')
  .get(authorize(staffRoles), getReturns)
  .post(authorize(staffRoles), createReturn);

router.route('/:id').get(authorize(staffRoles), getReturn);

export default router;
