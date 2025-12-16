import React, { useState, useEffect } from 'react';
import { clothingService } from '../services/clothing.service';

const ClothingProductForm = ({ 
  subcategoryId, 
  categoryGroup,
  subcategoryName,
  initialData = {},
  onSubmit, 
  onCancel 
}) => {
  console.log('ClothingProductForm initialData:', initialData);
  const [loading, setLoading] = useState(false);
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [clothingSizes, setClothingSizes] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Initialize form data with initialData if provided (for editing)
  const [formData, setFormData] = useState({
    garmentType: initialData.garmentType || '',
    qualityLevel: initialData.qualityLevel || '',
    brand: initialData.brand || '',
    size: initialData.size || '',
    color: initialData.color || '',
    status: initialData.status || 'Usado como nuevo',
    conditionState: initialData.conditionState || 'Bueno',
    demand: initialData.demand || 'Media',
    cleanliness: initialData.cleanliness || 'Buena',
    quantity: initialData.quantity || 1,
    notes: initialData.notes || ''
  });

  // Check if we need to restore previous calculation
  useEffect(() => {
    if (initialData.garmentType && initialData.qualityLevel && !hasCalculated && !isRestoring) {
      // Small delay to ensure form is fully loaded
      setIsRestoring(true);
      setTimeout(() => {
        handleCalculate();
      }, 100);
    }
  }, [initialData.garmentType, initialData.qualityLevel]);

  // Mapeo de niveles de calidad para display
  const qualityLevels = [
    { value: 'economico', label: 'Económico' },
    { value: 'estandar', label: 'Estándar' },
    { value: 'alto', label: 'Alto' },
    { value: 'premium', label: 'Premium' }
  ];

  // Estados para la condición
  const statusOptions = ['Nuevo', 'Usado como nuevo', 'Usado con algún detalle'];
  const conditionOptions = ['Excelente', 'Bueno', 'Regular'];
  const demandOptions = ['Alta', 'Media', 'Baja'];
  const cleanlinessOptions = ['Buena', 'Regular', 'Mala'];

  useEffect(() => {
    const loadClothingData = async () => {
      if (!categoryGroup) return;
      
      setLoading(true);
      try {
        const [types, sizes] = await Promise.all([
          clothingService.getGarmentTypes(categoryGroup),
          clothingService.getClothingSizes(categoryGroup)
        ]);
        
        setGarmentTypes(types);
        setClothingSizes(sizes);
      } catch (error) {
        console.error('Error loading clothing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClothingData();
  }, [categoryGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset calculation when important fields change
    if (name === 'garmentType' || name === 'qualityLevel') {
      setCalculationResult(null);
      setHasCalculated(false);
    }
  };

  const handleCalculate = async () => {
    if (!formData.garmentType || !formData.qualityLevel) {
      alert('Por favor seleccione el tipo de prenda y la calidad antes de calcular.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Calcular valuación con precios fijos de ropa
      const valuationResult = await clothingService.calculateClothingValuation({
        subcategoryId,
        garmentType: formData.garmentType,
        qualityLevel: formData.qualityLevel,
        status: formData.status,
        conditionState: formData.conditionState,
        demand: formData.demand,
        cleanliness: formData.cleanliness
      });

      setCalculationResult(valuationResult);
      setHasCalculated(true);
    } catch (error) {
      console.error('Error calculating clothing valuation:', error);
      alert('Error al calcular la valuación. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si no se ha calculado, calcular primero
    if (!hasCalculated || !calculationResult) {
      await handleCalculate();
      return;
    }

    // Preparar datos para enviar al componente padre
    const productData = {
      status: formData.status,
      conditionState: formData.conditionState,
      demand: formData.demand,
      cleanliness: formData.cleanliness,
      quantity: formData.quantity,
      notes: formData.notes,
      features: {
        tipo: formData.garmentType,
        marca: formData.brand,
        talla: formData.size,
        color: formData.color
      },
      // Precios calculados
      suggestedPurchasePrice: calculationResult.purchasePrice,
      suggestedSalePrice: calculationResult.suggestedSalePrice,
      storeCreditPrice: calculationResult.storeCreditPrice,
      consignmentPrice: calculationResult.consignmentPrice,
      // Para mantener compatibilidad con el flujo existente
      new_price: calculationResult.purchasePrice * 3, // Estimación del precio nuevo
      isClothing: true,
      // Guardar datos del formulario para re-hidratación
      clothingFormData: {
        garmentType: formData.garmentType,
        qualityLevel: formData.qualityLevel,
        brand: formData.brand,
        size: formData.size,
        color: formData.color,
        status: formData.status,
        conditionState: formData.conditionState,
        demand: formData.demand,
        cleanliness: formData.cleanliness,
        quantity: formData.quantity,
        notes: formData.notes
      }
    };

    onSubmit(productData);
  };

  if (loading && garmentTypes.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de ropa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Valuación de Ropa - {subcategoryName}
        </h3>
        <p className="text-sm text-gray-600">
          Los precios de compra para ropa están predefinidos según el tipo de prenda y calidad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Prenda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Prenda *
            </label>
            <select
              name="garmentType"
              value={formData.garmentType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccione tipo de prenda</option>
              {garmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calidad *
            </label>
            <select
              name="qualityLevel"
              value={formData.qualityLevel}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccione calidad</option>
              {qualityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Características de la prenda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="Ej: Zara, H&M, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talla *
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccione talla</option>
              {clothingSizes.map(size => (
                <option key={size.id} value={size.size_value}>
                  {size.size_value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              placeholder="Ej: Azul, Rojo, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Estado y Condición */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado General *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condición *
            </label>
            <select
              name="conditionState"
              value={formData.conditionState}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {conditionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demanda *
            </label>
            <select
              name="demand"
              value={formData.demand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {demandOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limpieza *
            </label>
            <select
              name="cleanliness"
              value={formData.cleanliness}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {cleanlinessOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cantidad y Notas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observaciones adicionales"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Información sobre precios */}
        {formData.garmentType && formData.qualityLevel && !calculationResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El precio de compra para {formData.garmentType} de calidad {
                qualityLevels.find(q => q.value === formData.qualityLevel)?.label
              } está predefinido. El precio de venta se calculará según el estado y demanda.
            </p>
          </div>
        )}

        {/* Resultado del cálculo */}
        {calculationResult && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Resultado de la Valuación</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Precio de Compra:</p>
                <p className="text-xl font-bold text-blue-600">${calculationResult.purchasePrice.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio de Venta Sugerido:</p>
                <p className="text-xl font-bold text-green-600">${calculationResult.suggestedSalePrice.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio Crédito en Tienda:</p>
                <p className="text-lg font-semibold text-purple-600">${calculationResult.storeCreditPrice.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio Consignación:</p>
                <p className="text-lg font-semibold text-orange-600">${calculationResult.consignmentPrice.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          {!hasCalculated ? (
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading || !formData.garmentType || !formData.qualityLevel}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Calcular Valuación'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              Agregar al Resumen
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClothingProductForm;