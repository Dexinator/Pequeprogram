import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../db';

// Constante para envío gratis en CDMX
const FREE_SHIPPING_CDMX_MINIMUM = 895;

/**
 * Calcula el costo de envío basado en código postal y peso
 */
export const calculateShipping = asyncHandler(async (req: Request, res: Response) => {
  const { postal_code, weight_grams, weight_kg, items, subtotal } = req.body;

  if (!postal_code) {
    res.status(400).json({
      error: true,
      message: 'El código postal es requerido'
    });
    return;
  }

  // Sanitizar código postal: solo dígitos
  const cleanPostalCode = String(postal_code).replace(/[^0-9]/g, '');

  if (cleanPostalCode.length !== 5) {
    console.warn(`⚠️ Código postal inválido recibido: "${postal_code}" (limpio: "${cleanPostalCode}")`);
    res.status(400).json({
      error: true,
      message: `El código postal debe tener 5 dígitos. Recibido: "${postal_code}"`
    });
    return;
  }

  // Determinar el peso en gramos
  let totalWeight = weight_grams;
  
  // Si viene peso en kg, convertir a gramos
  if (weight_kg && !weight_grams) {
    totalWeight = weight_kg * 1000;
  }
  
  // Si no viene ningún peso, calcularlo desde los items
  if (!totalWeight && items && Array.isArray(items)) {
    // Calcular el peso total desde los items
    const itemsWithWeight = await Promise.all(
      items.map(async (item: any) => {
        const result = await pool.query(
          'SELECT weight_grams FROM valuation_items WHERE id = $1',
          [item.valuation_item_id]
        );
        
        if (result.rows.length > 0) {
          return result.rows[0].weight_grams * item.quantity;
        }
        return 0;
      })
    );
    
    totalWeight = itemsWithWeight.reduce((sum, weight) => sum + (weight || 0), 0);
  }

  if (!totalWeight || totalWeight <= 0) {
    res.status(400).json({ 
      error: true, 
      message: 'El peso total debe ser mayor a cero' 
    });
    return;
  }

  // Convertir peso de gramos a kilogramos para comparar con las tarifas
  const weightInKg = totalWeight / 1000;

  try {
    // Buscar la zona correspondiente al código postal (usando código limpio)
    const zoneResult = await pool.query(
      `SELECT sz.*
       FROM shipping_zones sz
       INNER JOIN shipping_zone_postcodes szp ON sz.id = szp.zone_id
       WHERE szp.postal_code = $1 AND sz.is_active = true
       LIMIT 1`,
      [cleanPostalCode]
    );

    let zone;
    if (zoneResult.rows.length === 0) {
      // Si no se encuentra el código postal específico, usar zona Nacional
      console.log(`📦 CP ${cleanPostalCode} no encontrado en zonas específicas, usando zona Nacional`);
      const nationalZone = await pool.query(
        'SELECT * FROM shipping_zones WHERE zone_code = $1 AND is_active = true',
        ['nacional']
      );

      if (nationalZone.rows.length === 0) {
        console.error('❌ Zona Nacional no encontrada o inactiva en shipping_zones');
        res.status(500).json({
          error: true,
          message: 'No se pudo determinar la zona de envío. Intenta de nuevo o selecciona recoger en tienda.'
        });
        return;
      }
      
      zone = nationalZone.rows[0];
    } else {
      zone = zoneResult.rows[0];
    }

    // Buscar la tarifa correspondiente al peso
    const rateResult = await pool.query(
      `SELECT * FROM shipping_rates 
       WHERE zone_id = $1 
       AND weight_from <= $2 
       AND (weight_to >= $2 OR weight_to IS NULL)
       AND is_active = true
       ORDER BY weight_from DESC
       LIMIT 1`,
      [zone.id, weightInKg]
    );

    if (rateResult.rows.length === 0) {
      // Si el peso excede las tarifas definidas, usar la tarifa más alta
      const highestRate = await pool.query(
        `SELECT * FROM shipping_rates 
         WHERE zone_id = $1 AND is_active = true
         ORDER BY weight_from DESC
         LIMIT 1`,
        [zone.id]
      );
      
      if (highestRate.rows.length === 0) {
        res.status(500).json({ 
          error: true, 
          message: 'No se encontraron tarifas de envío para esta zona' 
        });
        return;
      }
      
      const rate = highestRate.rows[0];

      // Calcular envío gratis para CDMX
      const originalShippingCost = parseFloat(rate.price);
      const isCDMX = zone.zone_code === 'cdmx';
      const currentSubtotal = subtotal ? parseFloat(subtotal) : 0;
      const qualifiesForFreeShipping = isCDMX && currentSubtotal >= FREE_SHIPPING_CDMX_MINIMUM;
      const finalShippingCost = qualifiesForFreeShipping ? 0 : originalShippingCost;
      const amountForFreeShipping = isCDMX && currentSubtotal < FREE_SHIPPING_CDMX_MINIMUM
        ? FREE_SHIPPING_CDMX_MINIMUM - currentSubtotal
        : 0;

      res.json({
        zone: {
          id: zone.id,
          name: zone.zone_name,
          code: zone.zone_code
        },
        weight: {
          grams: totalWeight,
          kg: weightInKg
        },
        shipping_cost: finalShippingCost,
        original_shipping_cost: originalShippingCost,
        free_shipping_applied: qualifiesForFreeShipping,
        free_shipping_eligible: isCDMX,
        free_shipping_minimum: isCDMX ? FREE_SHIPPING_CDMX_MINIMUM : null,
        amount_for_free_shipping: amountForFreeShipping,
        currency: rate.currency || 'MXN',
        message: qualifiesForFreeShipping
          ? `¡Envío gratis a ${zone.zone_name}!`
          : `Envío a ${zone.zone_name} para ${weightInKg.toFixed(2)} kg`
      });
    } else {
      const rate = rateResult.rows[0];

      // Calcular envío gratis para CDMX
      const originalShippingCost = parseFloat(rate.price);
      const isCDMX = zone.zone_code === 'cdmx';
      const currentSubtotal = subtotal ? parseFloat(subtotal) : 0;
      const qualifiesForFreeShipping = isCDMX && currentSubtotal >= FREE_SHIPPING_CDMX_MINIMUM;
      const finalShippingCost = qualifiesForFreeShipping ? 0 : originalShippingCost;
      const amountForFreeShipping = isCDMX && currentSubtotal < FREE_SHIPPING_CDMX_MINIMUM
        ? FREE_SHIPPING_CDMX_MINIMUM - currentSubtotal
        : 0;

      res.json({
        zone: {
          id: zone.id,
          name: zone.zone_name,
          code: zone.zone_code
        },
        weight: {
          grams: totalWeight,
          kg: weightInKg
        },
        shipping_cost: finalShippingCost,
        original_shipping_cost: originalShippingCost,
        free_shipping_applied: qualifiesForFreeShipping,
        free_shipping_eligible: isCDMX,
        free_shipping_minimum: isCDMX ? FREE_SHIPPING_CDMX_MINIMUM : null,
        amount_for_free_shipping: amountForFreeShipping,
        currency: rate.currency || 'MXN',
        message: qualifiesForFreeShipping
          ? `¡Envío gratis a ${zone.zone_name}!`
          : `Envío a ${zone.zone_name} para ${weightInKg.toFixed(2)} kg`
      });
    }
  } catch (error) {
    console.error('Error calculando envío:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error al calcular el costo de envío' 
    });
  }
});

/**
 * Obtiene todas las zonas de envío disponibles
 */
export const getShippingZones = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM shipping_zones WHERE is_active = true ORDER BY zone_name'
  );
  
  res.json(result.rows);
});

/**
 * Obtiene las tarifas de una zona específica
 */
export const getZoneRates = asyncHandler(async (req: Request, res: Response) => {
  const { zoneId } = req.params;
  
  const result = await pool.query(
    `SELECT sr.*, sz.zone_name, sz.zone_code 
     FROM shipping_rates sr
     INNER JOIN shipping_zones sz ON sr.zone_id = sz.id
     WHERE sr.zone_id = $1 AND sr.is_active = true
     ORDER BY sr.weight_from`,
    [zoneId]
  );
  
  if (result.rows.length === 0) {
    res.status(404).json({ 
      error: true, 
      message: 'No se encontraron tarifas para esta zona' 
    });
    return;
  }
  
  res.json(result.rows);
});

/**
 * Valida si un código postal está disponible para envío
 */
export const validatePostalCode = asyncHandler(async (req: Request, res: Response) => {
  const { postal_code } = req.params;
  
  const result = await pool.query(
    `SELECT sz.* 
     FROM shipping_zones sz
     INNER JOIN shipping_zone_postcodes szp ON sz.id = szp.zone_id
     WHERE szp.postal_code = $1 AND sz.is_active = true
     LIMIT 1`,
    [postal_code]
  );
  
  if (result.rows.length === 0) {
    // Verificar si es un código postal válido para envío nacional
    const postalCodePattern = /^[0-9]{5}$/;
    if (postalCodePattern.test(postal_code)) {
      const nationalZone = await pool.query(
        'SELECT * FROM shipping_zones WHERE zone_code = $1 AND is_active = true',
        ['nacional']
      );
      
      if (nationalZone.rows.length > 0) {
        res.json({
          available: true,
          zone: nationalZone.rows[0],
          message: 'Envío disponible a nivel nacional'
        });
        return;
      }
    }
    
    res.json({
      available: false,
      message: 'Código postal no disponible para envío'
    });
    return;
  }
  
  res.json({
    available: true,
    zone: result.rows[0],
    message: 'Código postal válido para envío'
  });
});