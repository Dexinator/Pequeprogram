import React from 'react';
import { inventoryService } from '../../services/inventory.service';

export default function ProductDetailModal({ product, onClose }) {
  const valuationItem = product.valuation_item || {};
  const features = valuationItem.features || {};
  const isOtrProduct = product.id && product.id.startsWith('OTRP');

  // Agrupar características por tipo
  const getFeaturesByType = () => {
    const grouped = {
      principales: {},
      dimensiones: {},
      especificaciones: {},
      otros: {}
    };

    Object.entries(features).forEach(([key, value]) => {
      if (!value || value === '') return;

      // Clasificar por tipo de característica
      if (['modelo', 'tipo', 'marca', 'color', 'material', 'estilo'].includes(key)) {
        grouped.principales[key] = value;
      } else if (['talla', 'largo', 'ancho', 'alto', 'peso', 'capacidad'].includes(key)) {
        grouped.dimensiones[key] = value;
      } else if (['año', 'temporada', 'coleccion', 'edicion', 'version'].includes(key)) {
        grouped.especificaciones[key] = value;
      } else {
        grouped.otros[key] = value;
      }
    });

    // Filtrar grupos vacíos
    return Object.entries(grouped).filter(([_, features]) => Object.keys(features).length > 0);
  };

  const featureGroups = getFeaturesByType();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Detalle del Producto: {product.id}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
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
                <h4 className="font-medium text-gray-900 mb-3">Información de Inventario</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID Producto:</span> {product.id}</p>
                  <p><span className="font-medium">Cantidad en Stock:</span> 
                    <span className={`ml-2 font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.quantity} unidades
                    </span>
                  </p>
                  <p><span className="font-medium">Ubicación:</span> {product.location}</p>
                  <p><span className="font-medium">Fecha de Ingreso:</span> {inventoryService.formatDate(product.created_at)}</p>
                  <p><span className="font-medium">Última Actualización:</span> {inventoryService.formatDate(product.updated_at)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Clasificación del Producto</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Categoría:</span> {product.category_name || 'Sin categoría'}</p>
                  <p><span className="font-medium">Subcategoría:</span> {product.subcategory_name || 'Sin subcategoría'}</p>
                  {!isOtrProduct && (
                    <>
                      <p><span className="font-medium">Marca:</span> {product.brand_name || 'Sin marca'}</p>
                      {valuationItem.brand_renown && (
                        <p><span className="font-medium">Renombre de Marca:</span> {valuationItem.brand_renown}</p>
                      )}
                    </>
                  )}
                  {isOtrProduct && (
                    <p className="text-blue-600 font-semibold mt-2">
                      <span className="font-medium">Tipo:</span> Otros Productos (Compra Externa)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Valuación */}
            {valuationItem.id && !isOtrProduct && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Información de Valuación</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">ID Valuación:</span> #{valuationItem.valuation_id}</p>
                    <p><span className="font-medium">Estado:</span> {inventoryService.getConditionLabel(valuationItem.status)}</p>
                    <p><span className="font-medium">Modalidad:</span> {inventoryService.getModalityLabel(valuationItem.modality)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Condición:</span> {valuationItem.condition_state}</p>
                    <p><span className="font-medium">Demanda:</span> {valuationItem.demand}</p>
                    <p><span className="font-medium">Limpieza:</span> {valuationItem.cleanliness}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Score Compra:</span> {valuationItem.purchase_score}</p>
                    <p><span className="font-medium">Score Venta:</span> {valuationItem.sale_score}</p>
                    <p><span className="font-medium">Tienda Online:</span> 
                      <span className={`ml-1 ${valuationItem.online_store_ready ? 'text-green-600' : 'text-gray-500'}`}>
                        {valuationItem.online_store_ready ? 'Sí' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Precios */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Información de Precios</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {!isOtrProduct && valuationItem.new_price && (
                  <div>
                    <p className="text-gray-600">Precio Nuevo</p>
                    <p className="font-bold text-lg">{inventoryService.formatCurrency(valuationItem.new_price)}</p>
                  </div>
                )}
                {!isOtrProduct && valuationItem.suggested_purchase_price && (
                  <div>
                    <p className="text-gray-600">Precio Compra Sugerido</p>
                    <p className="font-bold text-lg">{inventoryService.formatCurrency(valuationItem.suggested_purchase_price)}</p>
                  </div>
                )}
                {!isOtrProduct && valuationItem.final_purchase_price && (
                  <div>
                    <p className="text-gray-600">Precio Compra Final</p>
                    <p className="font-bold text-lg text-purple-600">{inventoryService.formatCurrency(valuationItem.final_purchase_price)}</p>
                  </div>
                )}
                <div className="bg-white p-3 rounded border-2 border-green-500">
                  <p className="text-gray-600">Precio Venta</p>
                  <p className="font-bold text-xl text-green-600">{inventoryService.formatCurrency(product.final_sale_price || valuationItem.final_sale_price)}</p>
                </div>
              </div>
              {valuationItem.modality === 'consignacion' && valuationItem.consignment_price && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm">
                    <span className="font-medium">Precio Consignación:</span>
                    <span className="ml-2 font-bold text-lg text-pink-600">
                      {inventoryService.formatCurrency(valuationItem.consignment_price)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Características del Producto */}
            {!isOtrProduct && featureGroups.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Características Detalladas</h4>
                
                {featureGroups.map(([groupName, groupFeatures]) => (
                  <div key={groupName} className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-2 capitalize">
                      {groupName === 'principales' && 'Características Principales'}
                      {groupName === 'dimensiones' && 'Dimensiones y Medidas'}
                      {groupName === 'especificaciones' && 'Especificaciones'}
                      {groupName === 'otros' && 'Otras Características'}
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(groupFeatures).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="ml-2 text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Todas las características (vista técnica) */}
            {Object.keys(features).length > 0 && (
              <details className="bg-gray-100 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  Ver todas las características (Vista Técnica)
                </summary>
                <div className="p-4 pt-0">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(features, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Notas */}
            {valuationItem.notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{valuationItem.notes}</p>
              </div>
            )}

            {/* Imágenes (si existieran) */}
            {valuationItem.images && valuationItem.images.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Imágenes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {valuationItem.images.map((image, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Imagen {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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