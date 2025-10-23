import { Router } from 'express';
import {
  processPayment,
  handleWebhook,
  getPaymentStatus,
  listOnlineSales,
  getOnlineSalesStats,
  getOnlineSaleById
} from '../controllers/onlinePayment.controller';

const router = Router();

// Ruta para procesar pagos con MercadoPago
router.post('/process', processPayment);

// Ruta para webhook de notificaciones de MercadoPago
router.post('/webhook', handleWebhook);

// Ruta para obtener estadísticas de ventas online
router.get('/stats', getOnlineSalesStats);

// Ruta para obtener estado de un pago por payment_id
router.get('/status/:paymentId', getPaymentStatus);

// Ruta para listar todas las ventas online con filtros
router.get('/', listOnlineSales);

// Ruta para obtener detalle de una venta online por ID
router.get('/:id', getOnlineSaleById);

export default router;