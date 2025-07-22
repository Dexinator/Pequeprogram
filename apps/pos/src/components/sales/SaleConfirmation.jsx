import React from 'react';
import { formatCurrency, formatDate } from '../../services/sales.service';

export default function SaleConfirmation({ sale, onNewSale }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">¡Venta Exitosa!</h2>
        <p className="text-gray-600 mt-2">La venta se ha procesado correctamente</p>
      </div>

      {/* Resumen de la venta */}
      <div className="space-y-6 mb-8">
        {/* Información general */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Información de la Venta</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">ID de Venta</p>
              <p className="font-medium">#{sale.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha</p>
              <p className="font-medium">{formatDate(sale.sale_date)}</p>
            </div>
            <div>
              <p className="text-gray-600">Cliente</p>
              <p className="font-medium">{sale.client_name || 'Cliente Ocasional'}</p>
            </div>
            <div>
              <p className="text-gray-600">Total</p>
              <p className="font-medium text-lg text-green-600">{formatCurrency(sale.total_amount)}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        {sale.items && sale.items.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Productos Vendidos</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-center">Cantidad</th>
                    <th className="px-4 py-2 text-right">Precio Unit.</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium">{item.inventario_id}</p>
                          {item.product_info && (
                            <p className="text-xs text-gray-600">
                              {item.product_info.subcategory_name} - {item.product_info.brand_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">{item.quantity_sold}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Método de pago */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Método de Pago</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {sale.payment_method === 'mixto' && sale.payment_details ? (
              <div className="space-y-2">
                <p className="font-medium">Pago Mixto</p>
                {sale.payment_details.map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{detail.payment_method}:</span>
                    <span>{formatCurrency(detail.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="capitalize">{sale.payment_method}</p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex space-x-4">
        <button
          onClick={onNewSale}
          className="flex-1 py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          Nueva Venta
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Imprimir Ticket
        </button>
      </div>
    </div>
  );
}