import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';

export default function ProductEditModal({ product, onClose, onSave }) {
  const [notes, setNotes] = useState(product?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, [product.inventory_id]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const details = await productsService.getProductForEditing(product.inventory_id);
      if (details) {
        setProductDetails(details);
        setNotes(details.notes || '');
      }
    } catch (err) {
      console.error('Error al cargar detalles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await productsService.updateProductNotes(product.inventory_id, notes);
      onSave();
    } catch (err) {
      setError('Error al guardar las notas. Por favor intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderFeatures = (features) => {
    if (!features || typeof features !== 'object') return null;

    const featureEntries = Object.entries(features).filter(
      ([key, value]) => value && value !== '' && key !== 'id'
    );

    if (featureEntries.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-2">
        {featureEntries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-gray-600 capitalize">
              {key.replace(/_/g, ' ')}:
            </span>{' '}
            <span className="text-gray-900">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const data = productDetails || product;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Editar Producto - {product.inventory_id}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-pink-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Cargando detalles...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informacion del Producto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Categoria:</span>
                      <p className="font-medium">{data.category_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Subcategoria:</span>
                      <p className="font-medium">{data.subcategory_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Marca:</span>
                      <p className="font-medium">{data.brand_name || 'Sin marca'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Estado:</span>
                      <p className="font-medium">{productsService.getConditionLabel(data.condition_state)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Precio Tienda:</span>
                      <p className="font-medium text-green-600">
                        {productsService.formatCurrency(data.final_sale_price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Precio Online:</span>
                      <p className="font-medium text-blue-600">
                        {data.online_price
                          ? productsService.formatCurrency(data.online_price)
                          : 'No configurado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Ubicacion:</span>
                      <p className="font-medium">{data.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Cantidad:</span>
                      <p className="font-medium">{data.quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {data.features && Object.keys(data.features).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Caracteristicas</h4>
                    {renderFeatures(data.features)}
                  </div>
                )}

                {/* Online Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Estado en Tienda Online</h4>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        data.online_store_ready
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {data.online_store_ready ? 'Publicado' : 'No publicado'}
                    </span>
                    {data.online_featured && (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                        Destacado
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Notas del Producto
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      (Se mostraran en la descripcion de la tienda en linea)
                    </span>
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Escribe aqui informacion adicional sobre el producto que quieras mostrar a los clientes
                    en la tienda en linea. Por ejemplo: detalles especiales, condicion especifica,
                    accesorios incluidos, etc.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Escribe las notas del producto aqui..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {notes.length} caracteres
                  </p>
                </div>

                {/* Images preview */}
                {data.images && data.images.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Imagenes ({data.images.length})
                    </h4>
                    <div className="flex gap-2 overflow-x-auto">
                      {data.images.slice(0, 5).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Producto ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                      {data.images.length > 5 && (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md text-gray-600 text-sm">
                          +{data.images.length - 5} mas
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Notas'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
