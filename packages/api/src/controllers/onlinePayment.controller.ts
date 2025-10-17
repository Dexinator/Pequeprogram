import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../db';
const mercadopago = require('mercadopago');

// Configuración de MercadoPago SDK v2
const sdk = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

// Verificar que el token esté configurado
if (!process.env.MP_ACCESS_TOKEN) {
  console.error('⚠️ ADVERTENCIA: MP_ACCESS_TOKEN no está configurado en las variables de entorno');
}

/**
 * Procesa un pago con tarjeta mediante MercadoPago
 */
export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const {
    transaction_amount,
    token,
    description,
    installments,
    issuer_id,
    payer,
    items,
    shipping_address,
    shipping_cost,
    shipping_zone_id,
    total_weight_grams,
    device_id
  } = req.body;

  console.log("Datos recibidos en req.body:", JSON.stringify(req.body, null, 2));
  console.log("Tipo de transaction_amount:", typeof transaction_amount, "Valor:", transaction_amount);
  
  // Validación extendida de transaction_amount
  if (!transaction_amount) {
    res.status(400).json({
      error: true,
      message: "El monto de la transacción no puede estar vacío",
      debug_info: {
        received_value: transaction_amount,
        type: typeof transaction_amount
      }
    });
    return;
  }

  if (transaction_amount === "null" || transaction_amount === "undefined") {
    res.status(400).json({
      error: true,
      message: "El monto de la transacción tiene un valor inválido",
      debug_info: {
        received_value: transaction_amount,
        type: typeof transaction_amount
      }
    });
    return;
  }

  // Asegúrate de que sea un número válido
  let amount: number;
  try {
    amount = parseFloat(transaction_amount);
    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({
        error: true,
        message: "El monto de la transacción debe ser un número mayor a cero",
        debug_info: {
          received_value: transaction_amount,
          parsed_value: amount,
          type: typeof amount
        }
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      error: true,
      message: "Error al procesar el monto de la transacción",
      debug_info: {
        received_value: transaction_amount,
        error_message: (error as Error).message
      }
    });
    return;
  }

  // Verificar disponibilidad de stock para los items
  if (items && Array.isArray(items)) {
    for (const item of items) {
      // Si viene con SKU (inventory_id), resolver a valuation_item_id
      let valuation_item_id = item.valuation_item_id;
      
      if (!valuation_item_id && item.sku) {
        const skuResult = await pool.query(
          'SELECT valuation_item_id FROM inventario WHERE id = $1',
          [item.sku]
        );
        if (skuResult.rows.length > 0) {
          valuation_item_id = skuResult.rows[0].valuation_item_id;
          item.valuation_item_id = valuation_item_id; // Actualizar para uso posterior
        }
      }
      
      if (!valuation_item_id) {
        res.status(400).json({ 
          error: true, 
          message: `No se pudo identificar el producto ${item.sku || item.valuation_item_id}` 
        });
        return;
      }
      
      const result = await pool.query(
        'SELECT vi.id, i.quantity FROM valuation_items vi ' +
        'INNER JOIN inventario i ON i.valuation_item_id = vi.id ' +
        'WHERE vi.id = $1 AND vi.online_store_ready = true',
        [valuation_item_id]
      );
      
      if (result.rows.length === 0) {
        res.status(400).json({ 
          error: true, 
          message: `El producto con ID ${item.valuation_item_id} no está disponible para venta online` 
        });
        return;
      }
      
      const producto = result.rows[0];
      if (producto.quantity < item.quantity) {
        res.status(400).json({ 
          error: true, 
          message: `Stock insuficiente para el producto. Stock disponible: ${producto.quantity}` 
        });
        return;
      }
    }
  }

  // Cabecera de idempotencia para evitar pagos duplicados
  const requestOptions = {
    idempotencyKey: req.get('x-idempotency-key') || Date.now().toString()
  };

  // Datos del pago con formato correcto para el monto
  const paymentData: any = {
    transaction_amount: Number(parseFloat(transaction_amount).toFixed(2)), // Asegurar formato con 2 decimales
    token,
    description: description || "Compra en Tienda Entrepeques",
    installments: Number(installments) || 1,
    payment_method_id: req.body.payment_method_id,
    issuer_id: req.body.issuer_id,
    payer: {
      email: payer?.email || "cliente@entrepeques.com",
      first_name: payer?.first_name || "Cliente",
      last_name: payer?.last_name || "Tienda"
    },
    additional_info: {
      items: items?.map((item: any) => ({
        id: item.valuation_item_id?.toString(),
        title: item.title || "Producto",
        quantity: item.quantity,
        unit_price: item.unit_price
      })) || []
    }
  };

  // NOTA: El device_id NO se envía en el body del pago
  // MercadoPago lo captura automáticamente cuando advancedFraudPrevention: true
  // está habilitado en el SDK del frontend
  if (device_id) {
    console.log('✅ Device fingerprint recibido del frontend (se usa automáticamente):', device_id.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ ADVERTENCIA: No se recibió device fingerprint del frontend');
  }

  // Añadir información de teléfono si está disponible
  if (payer?.phone?.number) {
    (paymentData.payer as any).phone = {
      area_code: payer.phone.area_code || "",
      number: payer.phone.number
    };
  }

  // Añadir identificación si está disponible y es requerida
  if (payer?.identification?.type && payer?.identification?.number) {
    (paymentData.payer as any).identification = {
      type: payer.identification.type,
      number: payer.identification.number
    };
  }

  // Loguear datos ANTES de enviar
  console.log("Datos a enviar a MercadoPago:", paymentData);
  console.log("Token recibido:", token);
  console.log("Monto final formateado:", paymentData.transaction_amount, "Tipo:", typeof paymentData.transaction_amount);

  try {
    // Crear el pago con MercadoPago SDK v2
    const paymentClient = new mercadopago.Payment(sdk);
    const response = await paymentClient.create({
      body: paymentData,
      requestOptions
    });

    // Loguear respuesta completa
    console.log("Respuesta COMPLETA de MercadoPago:", JSON.stringify(response, null, 2)); 

    // Obtener datos de la respuesta
    const paymentResult = response.response || response;

    // Construir respuesta en formato consistente
    const responseBody = {
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      id: paymentResult.id,
      date_created: paymentResult.date_created,
      payment_method_id: paymentResult.payment_method_id
    };

    if (paymentResult.status === 'approved') {
      console.log("==> Pago APROBADO detectado en backend. ID:", paymentResult.id);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Crear el registro de venta online con información de envío
        const saleResult = await client.query(
          `INSERT INTO online_sales (
            payment_id, customer_email, customer_name, customer_phone,
            shipping_address, total_amount, payment_status, payment_method,
            payment_date, notes, shipping_cost, shipping_zone_id, 
            shipping_postal_code, shipping_street, shipping_city, 
            shipping_state, total_weight_grams
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
          [
            paymentResult.id,
            payer?.email || "cliente@entrepeques.com",
            `${payer?.first_name || "Cliente"} ${payer?.last_name || "Tienda"}`,
            payer?.phone?.number || null,
            shipping_address ? JSON.stringify(shipping_address) : null,
            amount,
            paymentResult.status,
            paymentResult.payment_method_id,
            new Date(),
            null,
            shipping_cost || 0,
            shipping_zone_id || null,
            shipping_address?.postal_code || null,
            shipping_address?.street || null,
            shipping_address?.city || null,
            shipping_address?.state || null,
            total_weight_grams || null
          ]
        );
        
        const saleId = saleResult.rows[0].id;
        
        // Guardar los detalles de la venta y actualizar inventario
        if (items && Array.isArray(items)) {
          for (const item of items) {
            // Insertar item de venta
            await client.query(
              `INSERT INTO online_sale_items (
                online_sale_id, valuation_item_id, quantity, unit_price, subtotal
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                saleId,
                item.valuation_item_id,
                item.quantity,
                item.unit_price,
                item.unit_price * item.quantity
              ]
            );
            
            // Actualizar stock en inventario
            await client.query(
              'UPDATE inventario SET quantity = quantity - $1 WHERE valuation_item_id = $2',
              [item.quantity, item.valuation_item_id]
            );
          }
        }
        
        await client.query('COMMIT');
        console.log(`Venta online guardada con éxito. ID: ${saleId}, Pago ID: ${paymentResult.id}`);
        
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('Error al guardar la venta en la base de datos:', dbError);
        // No bloquear la respuesta al cliente, el pago ya fue procesado
      } finally {
        client.release();
      }
      
      res.status(201).json(responseBody);
    } else if (paymentResult.status === 'rejected') {
      console.log("==> Pago RECHAZADO detectado en backend. Status:", paymentResult.status, "Detail:", paymentResult.status_detail);
      res.status(400).json(responseBody);
    } else {
      console.log("==> Pago con estado PENDIENTE/OTRO detectado en backend. Status:", paymentResult.status, "Detail:", paymentResult.status_detail);
      res.status(200).json(responseBody);
    }

  } catch (error: any) {
    console.error('=== ERROR COMPLETO DE MERCADOPAGO ===');
    console.error('Error object:', JSON.stringify(error, null, 2));
    console.error('Error.message:', error.message);
    console.error('Error.status:', error.status);
    console.error('Error.cause:', error.cause);
    console.error('Error.apiResponse:', error.apiResponse);
    console.error('Error.response:', error.response);
    console.error('Error keys:', Object.keys(error));
    console.error('=== FIN DEL ERROR ===');
    
    // Mejorado manejo de errores para la V2 del SDK
    let errorMessage: string, errorStatus: number;
    let debugInfo: any = {};
    
    // Intentar obtener más información del error
    if (error.apiResponse) {
      debugInfo = error.apiResponse;
      errorMessage = error.apiResponse.message || 'Error en la API de MercadoPago';
      errorStatus = error.status || 500;
    } else if (error.cause && error.cause.length > 0) {
      errorMessage = error.cause[0]?.description || error.cause[0]?.message || error.message || 'Error desconocido al procesar el pago';
      errorStatus = error.status || 500;
      debugInfo = { cause: error.cause };
    } else if (error.response) {
      errorMessage = error.response.message || error.message || 'Error desconocido al procesar el pago';
      errorStatus = error.status || 500;
      debugInfo = { response: error.response };
    } else {
      errorMessage = error.message || 'Error desconocido al procesar el pago';
      errorStatus = 500;
      debugInfo = { rawError: error.toString() };
    }

    res.status(errorStatus || 500).json({
      error: true,
      message: 'Error al procesar el pago',
      details: errorMessage,
      cause: error.cause || [],
      debug: process.env.NODE_ENV === 'development' ? debugInfo : undefined
    });
  }
});

/**
 * Maneja las notificaciones de MercadoPago (webhooks)
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { id, topic } = req.query;
  
  if (topic === 'payment') {
    try {
      // Actualizado para usar la nueva API
      const paymentClient = new mercadopago.Payment(sdk);
      const paymentInfo = await paymentClient.get({ id: id as string });
      
      console.log('Notificación de pago recibida:', paymentInfo);
      
      // Actualizar el estado de la venta en la base de datos
      const payment = paymentInfo.response || paymentInfo;
      
      if (payment && payment.id) {
        const result = await pool.query(
          'UPDATE online_sales SET payment_status = $1, updated_at = NOW() WHERE payment_id = $2',
          [payment.status, payment.id.toString()]
        );
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`Venta actualizada a estado: ${payment.status} para pago ID: ${payment.id}`);
        } else {
          console.log(`No se encontró venta asociada al pago ID: ${payment.id}`);
        }
      }
    } catch (error) {
      console.error('Error procesando webhook de MercadoPago:', error);
    }
  }

  res.status(200).send('OK');
});

/**
 * Obtiene el estado de una venta online por ID de pago
 */
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  
  const result = await pool.query(
    `SELECT os.*, array_agg(
      json_build_object(
        'valuation_item_id', osi.valuation_item_id,
        'quantity', osi.quantity,
        'unit_price', osi.unit_price,
        'subtotal', osi.subtotal
      )
    ) as items
    FROM online_sales os
    LEFT JOIN online_sale_items osi ON os.id = osi.online_sale_id
    WHERE os.payment_id = $1
    GROUP BY os.id`,
    [paymentId]
  );
  
  if (result.rows.length === 0) {
    res.status(404).json({ error: true, message: 'Venta no encontrada' });
    return;
  }
  
  res.json(result.rows[0]);
});