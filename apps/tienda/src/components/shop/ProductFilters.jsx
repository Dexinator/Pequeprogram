import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';

const ProductFilters = ({ 
  categoryId, 
  subcategories = [], 
  onFilterChange, 
  currentFilters = {} 
}) => {
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.min_price || '',
    max: currentFilters.max_price || ''
  });
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState({});
  
  // Cargar feature definitions cuando cambia la subcategoría
  useEffect(() => {
    if (currentFilters.subcategory_id) {
      loadFeatureDefinitions(currentFilters.subcategory_id);
    }
  }, [currentFilters.subcategory_id]);
  
  const loadFeatureDefinitions = async (subcategoryId) => {
    try {
      const features = await productsService.getFeatureDefinitions(subcategoryId);
      setFeatureDefinitions(features);
    } catch (error) {
      console.error('Error al cargar features:', error);
    }
  };
  
  const handleSubcategoryChange = (subcategoryId) => {
    const newFilters = {
      ...currentFilters,
      subcategory_id: subcategoryId ? parseInt(subcategoryId) : undefined
    };
    
    // Limpiar filtros dinámicos al cambiar de subcategoría
    setDynamicFilters({});
    onFilterChange(newFilters);
  };
  
  const handleConditionChange = (condition) => {
    onFilterChange({
      ...currentFilters,
      condition_state: condition || undefined
    });
  };
  
  const handleLocationChange = (location) => {
    onFilterChange({
      ...currentFilters,
      location: location || undefined
    });
  };
  
  const handlePriceSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      ...currentFilters,
      min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
      max_price: priceRange.max ? parseFloat(priceRange.max) : undefined
    });
  };
  
  const handleFeatureChange = (featureName, value) => {
    const newDynamicFilters = {
      ...dynamicFilters,
      [featureName]: value || undefined
    };
    
    // Eliminar valores undefined
    Object.keys(newDynamicFilters).forEach(key => {
      if (newDynamicFilters[key] === undefined) {
        delete newDynamicFilters[key];
      }
    });
    
    setDynamicFilters(newDynamicFilters);
    
    onFilterChange({
      ...currentFilters,
      features: newDynamicFilters
    });
  };
  
  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setDynamicFilters({});
    onFilterChange({
      category_id: categoryId
    });
  };
  
  const hasActiveFilters = () => {
    return Object.keys(currentFilters).length > 1 || Object.keys(dynamicFilters).length > 0;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            Limpiar todo
          </button>
        )}
      </div>
      
      {/* Subcategorías */}
      {subcategories.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-3">Subcategoría</h4>
          <select
            value={currentFilters.subcategory_id || ''}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Precio */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">Precio</h4>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              min="0"
              step="0.01"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Aplicar
          </button>
        </form>
      </div>
      
      {/* Estado/Condición */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">Condición</h4>
        <div className="space-y-2">
          {['excelente', 'bueno', 'regular'].map((condition) => (
            <label key={condition} className="flex items-center">
              <input
                type="radio"
                name="condition"
                value={condition}
                checked={currentFilters.condition_state === condition}
                onChange={(e) => handleConditionChange(e.target.value)}
                className="mr-2 text-pink-600 focus:ring-pink-500"
              />
              <span className="capitalize">{condition}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="condition"
              value=""
              checked={!currentFilters.condition_state}
              onChange={() => handleConditionChange('')}
              className="mr-2 text-pink-600 focus:ring-pink-500"
            />
            <span>Todas</span>
          </label>
        </div>
      </div>
      
      {/* Ubicación */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">Ubicación</h4>
        <select
          value={currentFilters.location || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Todas las tiendas</option>
          <option value="Polanco">Polanco</option>
          <option value="Satélite">Satélite</option>
        </select>
      </div>
      
      {/* Filtros dinámicos basados en features */}
      {featureDefinitions.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-3">Características</h4>
          <div className="space-y-3">
            {featureDefinitions.map((feature) => {
              // Solo mostrar features que tengan opciones definidas
              if (feature.type === 'select' && feature.options) {
                return (
                  <div key={feature.id}>
                    <label className="block text-sm text-gray-700 mb-1">
                      {feature.display_name}
                    </label>
                    <select
                      value={dynamicFilters[feature.name] || ''}
                      onChange={(e) => handleFeatureChange(feature.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      <option value="">Todos</option>
                      {feature.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else if (feature.type === 'text' || feature.type === 'number') {
                return (
                  <div key={feature.id}>
                    <label className="block text-sm text-gray-700 mb-1">
                      {feature.display_name}
                    </label>
                    <input
                      type={feature.type}
                      value={dynamicFilters[feature.name] || ''}
                      onChange={(e) => handleFeatureChange(feature.name, e.target.value)}
                      placeholder={`Buscar por ${feature.display_name.toLowerCase()}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;