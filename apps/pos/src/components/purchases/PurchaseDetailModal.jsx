import React from 'react';
import { otherProdsService } from '../../services/otherprods.service';

export default function PurchaseDetailModal({ purchase, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Detalle de Compra #{purchase.id}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {otherProdsService.formatDate(purchase.purchase_date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información de la Compra</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> #{purchase.id}</p>
                  <p><span className="font-medium">Fecha:</span> {otherProdsService.formatDate(purchase.purchase_date)}</p>
                  <p><span className="font-medium">Proveedor:</span> {purchase.supplier_name}</p>
                  <p><span className="font-medium">Ubicación:</span> {purchase.location}</p>
                  <p><span className="font-medium">Método de Pago:</span> 
                    <span className="capitalize ml-1">{purchase.payment_method}</span>
                  </p>
                  <p><span className="font-medium">Usuario:</span> 
                    {purchase.user ? `${purchase.user.first_name} ${purchase.user.last_name}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Resumen Financiero</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total de Productos:</span> {purchase.items?.length || 0}</p>
                  <p><span className="font-medium">Cantidad Total:</span> 
                    {purchase.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} unidades
                  </p>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-lg">
                      <span className="font-medium">Total Compra:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {otherProdsService.formatCurrency(purchase.total_amount)}
                      </span>
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Valor Estimado de Venta:</span>
                      <span className="ml-2 font-bold text-blue-600">
                        {otherProdsService.formatCurrency(
                          purchase.items?.reduce((sum, item) => sum + (item.sale_unit_price * item.quantity), 0) || 0
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            {purchase.notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-700">{purchase.notes}</p>
              </div>
            )}

            {/* Lista de Productos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Productos Comprados</h4>
              
              {purchase.items && purchase.items.length > 0 ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio Compra
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio Venta
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Margen
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Compra
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchase.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                              {item.sku}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {item.product_name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {otherProdsService.formatCurrency(item.purchase_unit_price)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">
                              {otherProdsService.formatCurrency(item.sale_unit_price)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${
                                otherProdsService.calculateMargin(item.purchase_unit_price, item.sale_unit_price) > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {otherProdsService.calculateMargin(item.purchase_unit_price, item.sale_unit_price).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {otherProdsService.formatCurrency(item.total_purchase_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td colSpan="6" className="px-4 py-3 text-right font-medium text-gray-900">
                            Total de la Compra:
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-pink-600">
                            {otherProdsService.formatCurrency(purchase.total_amount)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6" className="px-4 py-2 text-right text-sm text-gray-600">
                            Valor Potencial de Venta:
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-green-600">
                            {otherProdsService.formatCurrency(
                              purchase.items?.reduce((sum, item) => sum + (item.sale_unit_price * item.quantity), 0) || 0
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6" className="px-4 py-2 text-right text-sm text-gray-600">
                            Ganancia Potencial:
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                            {otherProdsService.formatCurrency(
                              (purchase.items?.reduce((sum, item) => sum + (item.sale_unit_price * item.quantity), 0) || 0) - purchase.total_amount
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron productos en esta compra
                </div>
              )}
            </div>

            {/* Información de Auditoria */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Información de Auditoría</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Creado:</span> {otherProdsService.formatDate(purchase.created_at)}</p>
                  <p><span className="font-medium">Actualizado:</span> {otherProdsService.formatDate(purchase.updated_at)}</p>
                </div>
                <div>
                  <p><span className="font-medium">Usuario:</span> 
                    {purchase.user ? `${purchase.user.first_name} ${purchase.user.last_name}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}