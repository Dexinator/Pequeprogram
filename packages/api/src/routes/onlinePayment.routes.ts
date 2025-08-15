import { Router } from 'express';
import { processPayment, handleWebhook, getPaymentStatus } from '../controllers/onlinePayment.controller';

const router = Router();

// Ruta para procesar pagos con MercadoPago
router.post('/process', processPayment);

// Ruta para webhook de notificaciones de MercadoPago
router.post('/webhook', handleWebhook);

// Ruta para obtener estado de un pago
router.get('/status/:paymentId', getPaymentStatus);

export default router;