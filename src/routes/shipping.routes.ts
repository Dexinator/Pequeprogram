import { Router } from 'express';
import { 
  calculateShipping, 
  getShippingZones, 
  getZoneRates, 
  validatePostalCode 
} from '../controllers/shipping.controller';

const router = Router();

// Calcular costo de envío
router.post('/calculate', calculateShipping);

// Obtener todas las zonas de envío
router.get('/zones', getShippingZones);

// Obtener tarifas de una zona específica
router.get('/zones/:zoneId/rates', getZoneRates);

// Validar código postal
router.get('/validate/:postal_code', validatePostalCode);

export default router;