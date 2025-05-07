import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { ValuationService } from '../services';

export function ProductoForm({ 
  id = "producto-form", 
  index = 0, 
  className = "", 
  onRemove,
  onChange = () => {} 
}) {
  const productoId = `${id}-${index}`;
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    status: "",
    brand_id: "",
    brand_renown: "",
    modality: "",
    condition_state: "",
    demand: "media", // Valor predeterminado
    cleanliness: "buena", // Valor predeterminado
    new_price: "",
    features: {},
    notes: ""
  });
  
  // Estados para listas y opciones
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  
  // Estados para funcionalidades adicionales
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  
  // Estado para resultado de valuación
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Servicio de valuación
  const valuationService = new ValuationService();
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await valuationService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (!formData.category_id) {
      setSubcategories([]);
      return;
    }
    
    const fetchSubcategories = async () => {
      setIsLoadingSubcategories(true);
      try {
        const data = await valuationService.getSubcategories(Number(formData.category_id));
        setSubcategories(data);
      } catch (error) {
        console.error('Error al cargar subcategorías:', error);
        setSubcategories([]);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };
    
    fetchSubcategories();
  }, [formData.category_id]);
  
  // Cargar marcas cuando cambia la subcategoría
  useEffect(() => {
    if (!formData.subcategory_id) {
      setBrands([]);
      return;
    }
    
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const data = await valuationService.getBrands(Number(formData.subcategory_id));
        setBrands(data);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        setBrands([]);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, [formData.subcategory_id]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Extraer el nombre real del campo sin el ID del producto
    const fieldName = name.replace(`-${productoId}`, '');
    
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    // Notificar cambios al componente padre
    onChange(newFormData);
  };
  
  // Calcular valuación
  const calculateValuation = async () => {
    // Validar campos requeridos
    if (!formData.subcategory_id || !formData.status || !formData.new_price) {
      alert('Por favor complete los campos obligatorios: Subcategoría, Estado y Precio Nuevo');
      return;
    }
    
    setIsCalculating(true);
    try {
      const calculationData = {
        subcategory_id: Number(formData.subcategory_id),
        status: formData.status,
        condition_state: formData.condition_state || 'bueno',
        demand: formData.demand || 'media',
        cleanliness: formData.cleanliness || 'buena',
        new_price: Number(formData.new_price)
      };
      
      const result = await valuationService.calculateValuation(calculationData);
      setCalculationResult(result);
    } catch (error) {
      console.error('Error al calcular valuación:', error);
      alert('Ocurrió un error al calcular la valuación. Intente nuevamente.');
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <div className={`producto-form ${className}`} data-index={index}>
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-heading font-bold text-azul-claro">Producto #{index + 1}</h2>
          
          {index > 0 && (
            <button 
              type="button" 
              className="text-rosa hover:text-rosa/80 p-1 remove-producto"
              onClick={onRemove}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Sección 1: Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`category_id-${productoId}`}>
              Categoría <span className="text-rosa">*</span>
            </label>
            <select 
              id={`category_id-${productoId}`} 
              name={`category_id-${productoId}`} 
              data-producto-id={productoId}
              className="categoria-select w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.category_id}
              onChange={handleChange}
              disabled={isLoadingCategories}
            >
              <option value="">
                {isLoadingCategories ? "Cargando categorías..." : "Seleccionar categoría"}
              </option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`subcategory_id-${productoId}`}>
              Subcategoría <span className="text-rosa">*</span>
            </label>
            <select 
              id={`subcategory_id-${productoId}`} 
              name={`subcategory_id-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.subcategory_id}
              onChange={handleChange}
              disabled={!formData.category_id || isLoadingSubcategories}
            >
              <option value="">
                {!formData.category_id 
                  ? "Seleccione primero una categoría" 
                  : isLoadingSubcategories 
                    ? "Cargando subcategorías..." 
                    : "Seleccionar subcategoría"}
              </option>
              {subcategories.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`status-${productoId}`}>
              Estado <span className="text-rosa">*</span>
            </label>
            <select 
              id={`status-${productoId}`} 
              name={`status-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Seleccionar estado</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado como nuevo">Usado como nuevo</option>
              <option value="Buen estado">Buen estado</option>
              <option value="Con detalles">Con detalles</option>
            </select>
          </div>
        </div>
        
        {/* Sección 2: Marca y Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`brand_id-${productoId}`}>
              Marca <span className="text-rosa">*</span>
            </label>
            <div className="flex gap-2">
              <select 
                id={`brand_id-${productoId}`} 
                name={`brand_id-${productoId}`}
                className="flex-1 p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                value={formData.brand_id}
                onChange={handleChange}
                disabled={!formData.subcategory_id || isLoadingBrands}
              >
                <option value="">
                  {!formData.subcategory_id 
                    ? "Seleccione primero una subcategoría" 
                    : isLoadingBrands 
                      ? "Cargando marcas..." 
                      : "Seleccionar marca"}
                </option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
                <option value="new">Otra marca...</option>
              </select>
              <button 
                type="button"
                className="px-3 py-2 bg-background border border-border rounded-md hover:bg-background-alt transition-colors"
                onClick={() => setShowNewBrand(!showNewBrand)}
              >
                +
              </button>
            </div>
            
            {showNewBrand && (
              <div className="mt-2">
                <input 
                  type="text" 
                  id={`new-brand-${productoId}`} 
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  placeholder="Nombre de la marca" 
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`brand_renown-${productoId}`}>
              Renombre de Marca <span className="text-rosa">*</span>
            </label>
            <select 
              id={`brand_renown-${productoId}`} 
              name={`brand_renown-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.brand_renown}
              onChange={handleChange}
            >
              <option value="">Seleccionar renombre</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`modality-${productoId}`}>
              Modalidad <span className="text-rosa">*</span>
            </label>
            <select 
              id={`modality-${productoId}`} 
              name={`modality-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.modality}
              onChange={handleChange}
            >
              <option value="">Seleccionar modalidad</option>
              <option value="compra directa">Compra directa</option>
              <option value="consignación">Consignación</option>
            </select>
          </div>
        </div>
        
        {/* Sección 3: Factores de Valuación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`condition_state-${productoId}`}>
              Condición <span className="text-rosa">*</span>
            </label>
            <select 
              id={`condition_state-${productoId}`} 
              name={`condition_state-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={formData.condition_state}
              onChange={handleChange}
            >
              <option value="">Seleccionar condición</option>
              <option value="excelente">Excelente</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`demand-${productoId}`}>
              Demanda
            </label>
            <select 
              id={`demand-${productoId}`} 
              name={`demand-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              value={formData.demand}
              onChange={handleChange}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`cleanliness-${productoId}`}>
              Limpieza
            </label>
            <select 
              id={`cleanliness-${productoId}`} 
              name={`cleanliness-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              value={formData.cleanliness}
              onChange={handleChange}
            >
              <option value="buena">Buena</option>
              <option value="regular">Regular</option>
              <option value="mala">Mala</option>
            </select>
          </div>
        </div>
        
        {/* Sección 4: Precio nuevo */}
        <div className="mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`new_price-${productoId}`}>
              Precio Nuevo de Referencia <span className="text-rosa">*</span>
            </label>
            <div className="flex items-center">
              <span className="bg-background-alt px-3 py-2 border border-border border-r-0 rounded-l-md">$</span>
              <input 
                type="number" 
                min="0"
                step="0.01"
                id={`new_price-${productoId}`} 
                name={`new_price-${productoId}`} 
                className="flex-1 p-2 border border-border rounded-r-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                placeholder="0.00" 
                required
                value={formData.new_price}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Botón de Valorar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={calculateValuation}
            className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculando...
              </span>
            ) : (
              'Valorar Producto'
            )}
          </button>
        </div>
        
        {/* Resultado de valoración */}
        {calculationResult && (
          <div id={`resultado-${productoId}`} className="mt-4 p-4 bg-verde-lima/10 border border-verde-lima rounded-md">
            <h3 className="text-lg font-bold text-verde-oscuro mb-2">Resultado de Valoración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-text-muted">Precio sugerido de compra:</p>
                <p className="text-xl font-bold text-azul-profundo">
                  ${calculationResult.suggested_purchase_price.toFixed(2)}
                </p>
                <p className="text-xs text-text-muted">Puntaje: {calculationResult.purchase_score}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Precio sugerido de venta:</p>
                <p className="text-xl font-bold text-verde-oscuro">
                  ${calculationResult.suggested_sale_price.toFixed(2)}
                </p>
                <p className="text-xs text-text-muted">Puntaje: {calculationResult.sale_score}</p>
              </div>
              {calculationResult.consignment_price && formData.modality === "consignación" && (
                <div>
                  <p className="text-sm text-text-muted">Precio en consignación:</p>
                  <p className="text-xl font-bold text-amarillo">
                    ${calculationResult.consignment_price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 