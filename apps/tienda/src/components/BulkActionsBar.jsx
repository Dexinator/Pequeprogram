import React, { useState } from 'react';

const BulkActionsBar = ({ selectedCount, onFeature, onUnfeature, onUnpublish, onCancel }) => {
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');

  const handleUnpublish = () => {
    if (!unpublishReason.trim()) {
      alert('Debes proporcionar una razón para despublicar');
      return;
    }
    onUnpublish(unpublishReason);
    setShowUnpublishConfirm(false);
    setUnpublishReason('');
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Barra flotante */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-azul-profundo text-white shadow-2xl border-t-4 border-brand-rosa z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={onFeature}
                  className="bg-brand-amarillo hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Marcar destacados
                </button>

                <button
                  onClick={onUnfeature}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Quitar destacados
                </button>

                <button
                  onClick={() => setShowUnpublishConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Despublicar
                </button>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="bg-transparent hover:bg-white/10 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Botones móviles */}
          <div className="md:hidden mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={onFeature}
              className="bg-brand-amarillo hover:bg-yellow-500 text-gray-900 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              ⭐ Destacar
            </button>

            <button
              onClick={onUnfeature}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Quitar ⭐
            </button>

            <button
              onClick={() => setShowUnpublishConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors col-span-2"
            >
              🗑️ Despublicar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para despublicar */}
      {showUnpublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                ⚠️ Despublicar {selectedCount} producto{selectedCount !== 1 ? 's' : ''}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Los productos seleccionados serán removidos de la tienda online.
                Esta acción se puede revertir volviendo a preparar los productos.
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Razón para despublicar *
                </label>
                <textarea
                  value={unpublishReason}
                  onChange={(e) => setUnpublishReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows="3"
                  placeholder="Ej: Productos con fotos incorrectas, actualización de inventario, etc."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnpublishConfirm(false);
                    setUnpublishReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnpublish}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Despublicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsBar;
