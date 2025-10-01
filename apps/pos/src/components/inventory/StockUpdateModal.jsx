import React, { useState } from 'react';

export default function StockUpdateModal({ product, currentQuantity, onConfirm, onClose }) {
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newQuantity < 0) {
      alert('La cantidad no puede ser negativa');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(newQuantity, reason);
      onClose();
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      alert('Error al actualizar el stock. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const difference = newQuantity - currentQuantity;
  const isIncreasing = difference > 0;
  const isDecreasing = difference < 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Actualizar Stock</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-1">Producto:</p>
          <p className="font-medium">{product.id} - {product.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Actual
            </label>
            <div className="text-2xl font-bold text-gray-900">{currentQuantity}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Cantidad
            </label>
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg"
              min="0"
              required
              autoFocus
            />
          </div>

          {difference !== 0 && (
            <div className={`mb-4 p-3 rounded-lg ${
              isIncreasing ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {isIncreasing ? 'Incremento' : 'Reducción'}: {Math.abs(difference)} unidades
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del Cambio (Opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Ajuste de inventario físico, devolución, rotura, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              rows="3"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || difference === 0}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Actualizando...
                </span>
              ) : (
                'Confirmar Cambio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}