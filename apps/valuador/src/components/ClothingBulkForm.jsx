import React, { useState, useEffect, useMemo } from 'react';
import { clothingService } from '../services/clothing.service';

const ClothingBulkForm = ({ subcategoryId, categoryGroup, onAddProducts, onCancel }) => {
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedGarmentType, setSelectedGarmentType] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [distribution, setDistribution] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const qualityLevels = ['economico', 'estandar', 'alto', 'premium'];
  const qualityLabels = {
    economico: 'Económico',
    estandar: 'Estándar',
    alto: 'Alto',
    premium: 'Premium'
  };

  // Load garment types and sizes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [garmentTypesData, sizesData] = await Promise.all([
          clothingService.getGarmentTypes(categoryGroup),
          clothingService.getSizes(categoryGroup)
        ]);
        setGarmentTypes(garmentTypesData);
        setSizes(sizesData);
      } catch (err) {
        console.error('Error loading clothing data:', err);
        setError('Error al cargar los datos de ropa');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryGroup]);

  // Load prices when garment type is selected
  useEffect(() => {
    const loadPrices = async () => {
      if (!selectedGarmentType) {
        setPrices({});
        return;
      }

      try {
        const pricesData = {};
        for (const quality of qualityLevels) {
          const price = await clothingService.getClothingPrice(
            categoryGroup,
            selectedGarmentType,
            quality
          );
          if (price) {
            pricesData[quality] = {
              purchase: price.purchase_price,
              sale: price.sale_price
            };
          }
        }
        setPrices(pricesData);
      } catch (err) {
        console.error('Error loading prices:', err);
      }
    };

    loadPrices();
  }, [selectedGarmentType, categoryGroup]);

  // Calculate totals by quality and size
  const totals = useMemo(() => {
    const qualityTotals = {};
    const sizeTotals = {};
    let grandTotal = 0;

    qualityLevels.forEach(quality => {
      qualityTotals[quality] = 0;
    });

    sizes.forEach(size => {
      sizeTotals[size.size_value] = 0;
    });

    Object.entries(distribution).forEach(([key, value]) => {
      const [quality, size] = key.split('-');
      const quantity = parseInt(value) || 0;
      
      qualityTotals[quality] = (qualityTotals[quality] || 0) + quantity;
      sizeTotals[size] = (sizeTotals[size] || 0) + quantity;
      grandTotal += quantity;
    });

    return { qualityTotals, sizeTotals, grandTotal };
  }, [distribution, sizes]);

  // Calculate total prices
  const totalPrices = useMemo(() => {
    let totalPurchase = 0;
    let totalSale = 0;

    Object.entries(distribution).forEach(([key, value]) => {
      const [quality] = key.split('-');
      const quantity = parseInt(value) || 0;
      
      if (prices[quality]) {
        totalPurchase += prices[quality].purchase * quantity;
        totalSale += prices[quality].sale * quantity;
      }
    });

    return {
      purchase: totalPurchase,
      sale: totalSale,
      storeCredit: totalPurchase * 1.1,
      consignment: totalPurchase * 1.2
    };
  }, [distribution, prices]);

  const handleDistributionChange = (quality, size, value) => {
    const key = `${quality}-${size}`;
    setDistribution(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    // Validate total quantity
    const enteredTotal = parseInt(totalQuantity) || 0;
    if (enteredTotal === 0) {
      alert('Por favor ingrese la cantidad total');
      return;
    }

    if (totals.grandTotal !== enteredTotal) {
      alert(`La suma de las cantidades (${totals.grandTotal}) no coincide con el total ingresado (${enteredTotal})`);
      return;
    }

    // Create products array for each combination with quantity > 0
    const products = [];
    
    Object.entries(distribution).forEach(([key, value]) => {
      const quantity = parseInt(value) || 0;
      if (quantity > 0) {
        const [quality, size] = key.split('-');
        
        // Create a product for this combination
        products.push({
          subcategory_id: subcategoryId,
          garmentType: selectedGarmentType,
          qualityLevel: quality,
          size: size,
          quantity: quantity,
          // Default values as specified
          brand: 'ropa',
          color: 'NA',
          condition_state: 'Bueno',
          demand: 'Media',
          cleanliness: 'Buena',
          status: 'Usado como nuevo',
          brand_renown: 'Normal',
          modality: 'compra directa',
          // Prices from database
          purchase_price: prices[quality]?.purchase || 0,
          suggested_purchase_price: prices[quality]?.purchase || 0,
          suggested_sale_price: prices[quality]?.sale || 0,
          store_credit_price: (prices[quality]?.purchase || 0) * 1.1,
          consignment_price: (prices[quality]?.purchase || 0) * 1.2,
          isClothing: true
        });
      }
    });

    if (products.length === 0) {
      alert('No se han ingresado cantidades');
      return;
    }

    // Pass products to parent component
    onAddProducts(products);
  };

  if (loading) {
    return <div className="p-4">Cargando datos de ropa...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Valuación Masiva de Ropa</h3>
      
      {/* Garment Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de prenda
        </label>
        <select
          value={selectedGarmentType}
          onChange={(e) => setSelectedGarmentType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccione un tipo de prenda</option>
          {garmentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {selectedGarmentType && (
        <>
          {/* Total Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad total
            </label>
            <input
              type="number"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              placeholder="0"
            />
          </div>

          {/* Distribution Matrix */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Distribución por Calidad y Talla</h4>
            
            {/* Show prices if available */}
            {Object.keys(prices).length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800 font-medium mb-2">Precios por calidad:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {qualityLevels.map(quality => prices[quality] && (
                    <div key={quality}>
                      <span className="font-medium">{qualityLabels[quality]}:</span>
                      <span className="ml-2">Compra: ${prices[quality].purchase}</span>
                      <span className="ml-2">Venta: ${prices[quality].sale}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left bg-gray-50">Calidad</th>
                    {sizes.map(size => (
                      <th key={size.id} className="border p-2 text-center bg-gray-50 min-w-[80px]">
                        {size.size_value}
                      </th>
                    ))}
                    <th className="border p-2 text-center bg-gray-100 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityLevels.map(quality => (
                    <tr key={quality}>
                      <td className="border p-2 font-medium bg-gray-50">
                        {qualityLabels[quality]}
                      </td>
                      {sizes.map(size => (
                        <td key={size.id} className="border p-2">
                          <input
                            type="number"
                            value={distribution[`${quality}-${size.size_value}`] || ''}
                            onChange={(e) => handleDistributionChange(quality, size.size_value, e.target.value)}
                            className="w-full px-2 py-1 text-center border rounded"
                            min="0"
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center bg-gray-100 font-semibold">
                        {totals.qualityTotals[quality] || 0}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Total</td>
                    {sizes.map(size => (
                      <td key={size.id} className="border p-2 text-center">
                        {totals.sizeTotals[size.size_value] || 0}
                      </td>
                    ))}
                    <td className="border p-2 text-center bg-gray-200">
                      <span className={totals.grandTotal === parseInt(totalQuantity || 0) ? 'text-green-600' : 'text-red-600'}>
                        {totals.grandTotal}
                      </span>
                      {totals.grandTotal === parseInt(totalQuantity || 0) && ' ✓'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Prices */}
          {totalQuantity && totals.grandTotal > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h4 className="text-lg font-medium mb-2">Resumen de Precios</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Compra Total</p>
                  <p className="text-xl font-semibold">${totalPrices.purchase.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Venta Total</p>
                  <p className="text-xl font-semibold">${totalPrices.sale.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crédito en Tienda</p>
                  <p className="text-xl font-semibold">${totalPrices.storeCredit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consignación</p>
                  <p className="text-xl font-semibold">${totalPrices.consignment.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedGarmentType || !totalQuantity || totals.grandTotal !== parseInt(totalQuantity || 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Agregar Productos
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ClothingBulkForm;