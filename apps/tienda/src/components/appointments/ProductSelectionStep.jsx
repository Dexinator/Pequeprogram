import React from 'react';

const ProductSelectionStep = ({
  subcategories,
  items,
  onChange,
  validationResult,
  onNext
}) => {
  const addProduct = () => {
    onChange([
      ...items,
      {
        id: Date.now(),
        subcategory: null,
        quantity: 1,
        isExcellent: true
      }
    ]);
  };

  const updateProduct = (id, updates) => {
    onChange(
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeProduct = id => {
    onChange(items.filter(item => item.id !== id));
  };

  // Group subcategories by category
  const groupedSubcategories = subcategories.reduce((acc, sub) => {
    const cat = sub.category_name;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {});

  // Calculate totals
  const clothingItems = items
    .filter(item => item.subcategory?.is_clothing)
    .reduce((sum, item) => sum + item.quantity, 0);
  const nonClothingItems = items
    .filter(item => item.subcategory && !item.subcategory.is_clothing)
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = clothingItems + nonClothingItems;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Instrucciones
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Selecciona el tipo de producto y la cantidad que traeras</li>
          <li>• Minimo 5 articulos (no ropa) o 20 prendas de ropa para cita</li>
          <li>• Solo valuamos articulos en <strong>excelente estado</strong></li>
        </ul>
      </div>

      {/* Product entries */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-200">
                Producto {index + 1}
              </h4>
              {items.length > 1 && (
                <button
                  onClick={() => removeProduct(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subcategory selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Tipo de producto
                </label>
                <select
                  value={item.subcategory?.id || ''}
                  onChange={e => {
                    const subcat = subcategories.find(
                      s => s.id === parseInt(e.target.value)
                    );
                    updateProduct(item.id, { subcategory: subcat });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoria</option>
                  {Object.entries(groupedSubcategories).map(([category, subs]) => (
                    <optgroup key={category} label={category}>
                      {subs.map(sub => (
                        <option
                          key={sub.id}
                          value={sub.id}
                          disabled={!sub.purchasing_enabled}
                        >
                          {sub.name}
                          {!sub.purchasing_enabled && ' - No estamos comprando'}
                          {sub.is_clothing && ' (Ropa)'}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {item.subcategory && !item.subcategory.purchasing_enabled && (
                  <p className="text-red-500 text-xs mt-1">
                    No estamos comprando esta categoria por el momento
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e =>
                    updateProduct(item.id, {
                      quantity: Math.max(1, parseInt(e.target.value) || 1)
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Excellent quality checkbox */}
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isExcellent}
                  onChange={e =>
                    updateProduct(item.id, { isExcellent: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">
                  El producto esta en <strong>excelente estado</strong> (limpio,
                  funcional, sin roturas)
                </span>
              </label>
              {!item.isExcellent && (
                <p className="text-orange-600 dark:text-orange-400 text-sm mt-1 ml-7">
                  Solo valuamos articulos en excelente condicion
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add product button */}
      <button
        onClick={addProduct}
        className="w-full py-3 border-2 border-dashed border-pink-400 text-pink-500 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors font-medium"
      >
        + Agregar otro tipo de articulo
      </button>

      {/* Summary */}
      {items.length > 0 && items.some(i => i.subcategory) && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
            Resumen
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-pink-500">{totalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total articulos
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{nonClothingItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No ropa
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-500">{clothingItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prendas ropa
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation message */}
      {validationResult && !validationResult.valid && (
        <div className={`p-4 rounded-lg border ${
          validationResult.type === 'minimum'
            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-start">
            <span className="text-xl mr-3">
              {validationResult.type === 'minimum' ? '📋' : '⚠️'}
            </span>
            <p>{validationResult.message}</p>
          </div>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={onNext}
        disabled={items.length === 0 || !items.some(i => i.subcategory)}
        className="w-full py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continuar
      </button>
    </div>
  );
};

export default ProductSelectionStep;
