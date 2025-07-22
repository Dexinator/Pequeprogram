import React, { useState } from 'react';
import { otherProdsService } from '../../services/otherprods.service';

export default function NewPurchase({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    supplier_name: '',
    payment_method: 'efectivo',
    location: 'Polanco',
    notes: ''
  });
  
  const [items, setItems] = useState([{
    product_name: '',
    quantity: 1,
    purchase_unit_price: 0,
    sale_unit_price: 0
  }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Agregar nuevo item
  const addItem = () => {
    setItems([...items, {
      product_name: '',
      quantity: 1,
      purchase_unit_price: 0,
      sale_unit_price: 0
    }]);
  };

  // Eliminar item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Actualizar item
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calcular totales
  const calculateTotals = () => {
    return items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.purchase_unit_price;
      return acc + itemTotal;
    }, 0);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.supplier_name.trim()) {
      setError('El nombre del proveedor es requerido');
      return;
    }

    // Validar items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_name.trim()) {
        setError(`El nombre del producto ${i + 1} es requerido`);
        return;
      }
      if (item.quantity <= 0) {
        setError(`La cantidad del producto ${i + 1} debe ser mayor a 0`);
        return;
      }
      if (item.purchase_unit_price < 0 || item.sale_unit_price < 0) {
        setError(`Los precios del producto ${i + 1} no pueden ser negativos`);
        return;
      }
    }

    setLoading(true);

    try {
      const purchaseData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          purchase_unit_price: parseFloat(item.purchase_unit_price),
          sale_unit_price: parseFloat(item.sale_unit_price)
        }))
      };

      const result = await otherProdsService.createPurchase(purchaseData);
      
      if (result) {
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      console.error('Error al crear compra:', error);
      setError(error.message || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Nueva Compra de Otros Productos</h3>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Nombre del proveedor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="Polanco">Polanco</option>
              <option value="Satélite">Satélite</option>
              <option value="Roma">Roma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Información adicional"
            />
          </div>
        </div>

        {/* Productos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700">Productos</h4>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              + Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-gray-700">Producto {index + 1}</h5>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Ej: Cigarros Marlboro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Precio Unitario Compra *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.purchase_unit_price}
                      onChange={(e) => updateItem(index, 'purchase_unit_price', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Precio Unitario Venta *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.sale_unit_price}
                      onChange={(e) => updateItem(index, 'sale_unit_price', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <span>Total del producto: </span>
                  <span className="font-medium">
                    {otherProdsService.formatCurrency(item.quantity * item.purchase_unit_price)}
                  </span>
                  {item.purchase_unit_price > 0 && item.sale_unit_price > 0 && (
                    <span className="ml-3">
                      Margen: <span className="font-medium text-green-600">
                        {otherProdsService.calculateMargin(item.purchase_unit_price, item.sale_unit_price).toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total y Acciones */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg">
              <span className="text-gray-600">Total de la compra: </span>
              <span className="font-bold text-pink-600">
                {otherProdsService.formatCurrency(calculateTotals())}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Compra'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}