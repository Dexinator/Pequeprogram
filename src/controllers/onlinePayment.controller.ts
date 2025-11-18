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
    device_id,
    delivery_method,
    pickup_postal_code
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

  // Validar delivery_method
  const isPickup = delivery_method === 'pickup';

  if (isPickup) {
    // Si es pickup, el costo de envío debe ser 0
    const actualShippingCost = parseFloat(shipping_cost) || 0;
    if (actualShippingCost !== 0) {
      res.status(400).json({
        error: true,
        message: 'El costo de envío debe ser $0 para recoger en tienda'
      });
      return;
    }
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
        
        // Preparar notas según método de entrega
        let saleNotes = null;
        let postalCodeToSave = null;

        if (isPickup) {
          saleNotes = 'RECOGER EN TIENDA - Av. Homero 1616, Polanco I Secc, Miguel Hidalgo, 11510 CDMX';
          postalCodeToSave = pickup_postal_code || null; // Para estadísticas
        } else {
          postalCodeToSave = shipping_address?.postal_code || null;
        }

        // Crear el registro de venta online con información de envío
        const saleResult = await client.query(
          `INSERT INTO online_sales (
            payment_id, customer_email, customer_name, customer_phone,
            shipping_address, total_amount, payment_status, payment_method,
            payment_date, notes, shipping_cost, shipping_zone_id,
            shipping_postal_code, shipping_street, shipping_city,
            shipping_state, total_weight_grams, delivery_method
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
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
            saleNotes, // Incluye nota de pickup si aplica
            shipping_cost || 0,
            shipping_zone_id || null,
            postalCodeToSave, // CP para envío o estadísticas
            isPickup ? null : (shipping_address?.street || null), // Solo si es envío
            isPickup ? null : (shipping_address?.city || null), // Solo si es envío
            isPickup ? null : (shipping_address?.state || null), // Solo si es envío
            total_weight_grams || null,
            delivery_method || 'shipping' // Nuevo campo
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

/**
 * Lista todas las ventas online con filtros opcionales
 */
export const listOnlineSales = asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    startDate,
    endDate,
    customerEmail,
    page = 1,
    limit = 20
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let whereConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filtro por estado de pago
  if (status) {
    whereConditions.push(`os.payment_status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }

  // Filtro por rango de fechas
  if (startDate) {
    whereConditions.push(`os.payment_date >= $${paramIndex}`);
    queryParams.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereConditions.push(`os.payment_date <= $${paramIndex}`);
    queryParams.push(endDate);
    paramIndex++;
  }

  // Filtro por email del cliente
  if (customerEmail) {
    whereConditions.push(`os.customer_email ILIKE $${paramIndex}`);
    queryParams.push(`%${customerEmail}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // Obtener el total de registros
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM online_sales os ${whereClause}`,
    queryParams
  );
  const totalRecords = parseInt(countResult.rows[0].count);

  // Obtener las ventas con sus items
  queryParams.push(Number(limit), offset);
  const result = await pool.query(
    `SELECT
      os.*,
      sz.zone_name,
      sz.zone_code,
      json_agg(
        json_build_object(
          'id', osi.id,
          'valuation_item_id', osi.valuation_item_id,
          'quantity', osi.quantity,
          'unit_price', osi.unit_price,
          'subtotal', osi.subtotal,
          'product_name', CONCAT(s.name, ' ', b.name),
          'subcategory_name', s.name,
          'brand_name', b.name,
          'inventory_id', i.id,
          'images', vi.images
        )
      ) as items
    FROM online_sales os
    LEFT JOIN online_sale_items osi ON os.id = osi.online_sale_id
    LEFT JOIN valuation_items vi ON osi.valuation_item_id = vi.id
    LEFT JOIN subcategories s ON vi.subcategory_id = s.id
    LEFT JOIN brands b ON vi.brand_id = b.id
    LEFT JOIN inventario i ON i.valuation_item_id = vi.id
    LEFT JOIN shipping_zones sz ON os.shipping_zone_id = sz.id
    ${whereClause}
    GROUP BY os.id, sz.zone_name, sz.zone_code
    ORDER BY os.payment_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    queryParams
  );

  res.json({
    sales: result.rows,
    pagination: {
      total: totalRecords,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalRecords / Number(limit))
    }
  });
});

/**
 * Obtiene estadísticas de ventas online
 */
export const getOnlineSalesStats = asyncHandler(async (req: Request, res: Response) => {
  // Total de ventas
  const totalSalesResult = await pool.query(
    `SELECT
      COUNT(*) as total_sales,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as average_sale
    FROM online_sales
    WHERE payment_status = 'approved'`
  );

  // Ventas por estado
  const salesByStatusResult = await pool.query(
    `SELECT
      payment_status,
      COUNT(*) as count,
      SUM(total_amount) as total
    FROM online_sales
    GROUP BY payment_status`
  );

  // Ventas de los últimos 7 días
  const recentSalesResult = await pool.query(
    `SELECT
      DATE(payment_date) as date,
      COUNT(*) as count,
      SUM(total_amount) as total
    FROM online_sales
    WHERE payment_date >= NOW() - INTERVAL '7 days'
    AND payment_status = 'approved'
    GROUP BY DATE(payment_date)
    ORDER BY date DESC`
  );

  // Productos más vendidos
  const topProductsResult = await pool.query(
    `SELECT
      s.name as subcategory_name,
      b.name as brand_name,
      SUM(osi.quantity) as total_quantity,
      SUM(osi.subtotal) as total_revenue
    FROM online_sale_items osi
    INNER JOIN valuation_items vi ON osi.valuation_item_id = vi.id
    INNER JOIN subcategories s ON vi.subcategory_id = s.id
    LEFT JOIN brands b ON vi.brand_id = b.id
    INNER JOIN online_sales os ON osi.online_sale_id = os.id
    WHERE os.payment_status = 'approved'
    GROUP BY s.name, b.name
    ORDER BY total_quantity DESC
    LIMIT 10`
  );

  // Zonas de envío más comunes
  const topShippingZonesResult = await pool.query(
    `SELECT
      sz.zone_name,
      sz.zone_code,
      COUNT(*) as count,
      SUM(os.shipping_cost) as total_shipping_revenue
    FROM online_sales os
    LEFT JOIN shipping_zones sz ON os.shipping_zone_id = sz.id
    WHERE os.payment_status = 'approved'
    GROUP BY sz.zone_name, sz.zone_code
    ORDER BY count DESC`
  );

  res.json({
    totalSales: totalSalesResult.rows[0],
    salesByStatus: salesByStatusResult.rows,
    recentSales: recentSalesResult.rows,
    topProducts: topProductsResult.rows,
    topShippingZones: topShippingZonesResult.rows
  });
});

/**
 * Obtiene el detalle completo de una venta online por ID
 */
export const getOnlineSaleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT
      os.*,
      sz.zone_name,
      sz.zone_code,
      json_agg(
        json_build_object(
          'id', osi.id,
          'valuation_item_id', osi.valuation_item_id,
          'quantity', osi.quantity,
          'unit_price', osi.unit_price,
          'subtotal', osi.subtotal,
          'product_name', CONCAT(s.name, ' ', b.name),
          'subcategory_name', s.name,
          'brand_name', b.name,
          'inventory_id', i.id,
          'images', vi.images,
          'features', vi.features
        )
      ) as items
    FROM online_sales os
    LEFT JOIN online_sale_items osi ON os.id = osi.online_sale_id
    LEFT JOIN valuation_items vi ON osi.valuation_item_id = vi.id
    LEFT JOIN subcategories s ON vi.subcategory_id = s.id
    LEFT JOIN brands b ON vi.brand_id = b.id
    LEFT JOIN inventario i ON i.valuation_item_id = vi.id
    LEFT JOIN shipping_zones sz ON os.shipping_zone_id = sz.id
    WHERE os.id = $1
    GROUP BY os.id, sz.zone_name, sz.zone_code`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: true, message: 'Venta no encontrada' });
    return;
  }

  res.json(result.rows[0]);
});