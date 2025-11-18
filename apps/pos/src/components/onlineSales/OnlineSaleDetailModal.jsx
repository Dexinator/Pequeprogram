import React from 'react';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazado';
    default:
      return status;
  }
};

export default function OnlineSaleDetailModal({ sale, onClose }) {
  if (!sale) return null;

  const subtotal = sale.total_amount - (sale.shipping_cost || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pedido Online #{sale.id}
            </h2>
            <p className="text-sm text-gray-500">Payment ID: {sale.payment_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Método de Entrega - Badge destacado */}
          <div className="mb-4">
            {sale.delivery_method === 'pickup' ? (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🏪</div>
                  <div>
                    <p className="text-lg font-bold text-green-900">RECOGER EN TIENDA</p>
                    <p className="text-sm text-green-700">El cliente recogerá su pedido en la tienda física</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🚚</div>
                  <div>
                    <p className="text-lg font-bold text-blue-900">ENVÍO A DOMICILIO</p>
                    <p className="text-sm text-blue-700">El pedido será enviado a la dirección del cliente</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Estado y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Estado del Pago</p>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(sale.payment_status)}`}>
                {getStatusText(sale.payment_status)}
              </span>
              <p className="text-xs text-gray-500 mt-2">Método: {sale.payment_method}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Fecha del Pedido</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(sale.payment_date)}</p>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="text-sm font-medium text-gray-900">{sale.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{sale.customer_email}</p>
                </div>
              </div>
              {sale.customer_phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">{sale.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dirección de Envío o Información de Tienda */}
          <div className="border-t pt-4">
            {sale.delivery_method === 'pickup' ? (
              // INFORMACIÓN DE LA TIENDA PARA RECOGER
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📍 Información para Recoger el Pedido
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200 space-y-4">
                  {/* Dirección de la tienda */}
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                      <span className="mr-2">🏢</span>
                      Dirección de la Tienda:
                    </p>
                    <div className="ml-6 text-sm text-gray-800 space-y-1">
                      <p className="font-medium">Av. Homero 1616</p>
                      <p>Polanco I Secc, Miguel Hidalgo</p>
                      <p>11510 Ciudad de México, CDMX</p>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                      <span className="mr-2">🕐</span>
                      Horarios de Atención:
                    </p>
                    <div className="ml-6 text-sm text-gray-800 space-y-1">
                      <p><span className="font-medium">Lunes - Viernes:</span> 11:00 am - 7:30 pm</p>
                      <p><span className="font-medium">Sábados:</span> 11:00 am - 6:30 pm</p>
                      <p className="text-red-600"><span className="font-medium">Domingos:</span> Cerrado</p>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                      <span className="mr-2">📞</span>
                      Contacto:
                    </p>
                    <div className="ml-6 text-sm text-gray-800 space-y-1">
                      <p>Teléfono: <a href="tel:+525565883245" className="text-blue-600 hover:underline">(55) 6588 3245</a></p>
                      <p>WhatsApp: <a href="https://wa.me/525523632389" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">(55) 2363 2389</a></p>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                      <span className="mr-2">💡</span>
                      Instrucciones:
                    </p>
                    <div className="ml-6 text-sm text-gray-800">
                      <p>Estacionamiento disponible con parquímetro. Llámanos al llegar y te ayudamos.</p>
                    </div>
                  </div>

                  {/* Botón de navegación */}
                  <div className="pt-3">
                    <a
                      href="https://www.google.com/maps/dir//Av.+Homero+1616,+Polanco,+Polanco+I+Secc,+Miguel+Hidalgo,+11510+Ciudad+de+México,+CDMX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      🗺️ Cómo Llegar
                    </a>
                  </div>
                </div>
              </>
            ) : (
              // DIRECCIÓN DE ENVÍO A DOMICILIO
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dirección de Envío</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-900">{sale.shipping_street}</p>
                  {sale.shipping_address?.neighborhood && (
                    <p className="text-sm text-gray-700">Colonia: {sale.shipping_address.neighborhood}</p>
                  )}
                  <p className="text-sm text-gray-700">
                    {sale.shipping_city}, {sale.shipping_state}
                  </p>
                  <p className="text-sm text-gray-700">CP: {sale.shipping_postal_code}</p>
                  {sale.shipping_address?.references && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Referencias:</p>
                      <p className="text-sm text-gray-700">{sale.shipping_address.references}</p>
                    </div>
                  )}
                  {sale.zone_name && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-blue-600 font-medium">
                        Zona de Envío: {sale.zone_name} ({sale.zone_code})
                      </p>
                    </div>
                  )}
                  {sale.total_weight_grams && (
                    <p className="text-sm text-gray-600">
                      Peso Total: {(sale.total_weight_grams / 1000).toFixed(2)} kg
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Productos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
            <div className="space-y-3">
              {sale.items && Array.isArray(sale.items) && sale.items.length > 0 ? (
                sale.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex gap-4">
                    {/* Imagen del producto */}
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}

                    {/* Detalles del producto */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.subcategory_name} {item.brand_name}
                      </p>
                      {item.inventory_id && (
                        <p className="text-xs text-gray-500">SKU: {item.inventory_id}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-600">
                          Precio unitario: {formatCurrency(item.unit_price)}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay productos en este pedido
                </p>
              )}
            </div>
          </div>

          {/* Resumen de Pago */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Pago</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal Productos:</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Costo de Envío:</span>
                {sale.delivery_method === 'pickup' ? (
                  <span className="font-semibold text-green-600">
                    ¡Gratis! (Recoger en tienda)
                  </span>
                ) : (
                  <span className="font-medium text-gray-900">
                    {formatCurrency(sale.shipping_cost || 0)}
                  </span>
                )}
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-pink-600">
                  {formatCurrency(sale.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          {sale.notes && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{sale.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
