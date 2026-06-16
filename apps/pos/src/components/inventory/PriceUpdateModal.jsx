import React, { useState } from 'react';

export default function PriceUpdateModal({ product, currentPrice, onConfirm, onClose }) {
  const [newPrice, setNewPrice] = useState(
    currentPrice !== null && currentPrice !== undefined ? String(currentPrice) : ''
  );
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num === null || num === undefined || isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('El precio debe ser un número válido mayor o igual a 0');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(priceNum, reason);
      onClose();
    } catch (error) {
      console.error('Error al actualizar precio:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar el precio. Por favor, intente nuevamente.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const oldNum = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  const newNum = parseFloat(newPrice);
  const difference = !isNaN(newNum) && !isNaN(oldNum) ? newNum - oldNum : 0;
  const isIncreasing = difference > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Editar Precio de Venta</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-1">Producto:</p>
          <p className="font-medium">{product.id} - {product.description}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Actual
            </label>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(currentPrice)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Precio (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg"
              required
              autoFocus
            />
          </div>

          {difference !== 0 && !isNaN(difference) && (
            <div className={`mb-4 p-3 rounded-lg ${
              isIncreasing ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {isIncreasing ? 'Incremento' : 'Reducción'}: {formatCurrency(Math.abs(difference))}
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
              placeholder="Ej: Ajuste de precio antes de publicar, corrección de valuación, etc."
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
              disabled={loading || difference === 0 || isNaN(newNum)}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Actualizando...
                </span>
              ) : (
                'Guardar Precio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
