import React, { useState, useEffect, useMemo } from 'react';
import { ImageUploader } from './ImageUploader';
import { ValuationService } from '../services';
import ClothingProductForm from './ClothingProductForm';
import { clothingService } from '../services/clothing.service';

export function ProductoForm({ 
  id = "producto-form", 
  index = 0, 
  className = "", 
  initialData = {},
  onRemove,
  onChange = () => {} 
}) {
  console.log('ProductoForm initialData:', initialData);
  // Crear un ID estable que no dependa del tiempo ni cambie entre servidor y cliente
  const productoId = `producto-${index}`;
  
  const [formData, setFormData] = useState({
    category_id: initialData.category_id || "",
    subcategory_id: initialData.subcategory_id || "",
    status: initialData.status || "",
    brand_id: initialData.brand_id || "",
    brand_renown: initialData.brand_renown || "",
    modality: initialData.modality || "compra directa",
    condition_state: initialData.condition_state || "",
    demand: initialData.demand || "media", // Valor predeterminado
    cleanliness: initialData.cleanliness || "buena", // Valor predeterminado
    new_price: initialData.new_price || "",
    quantity: initialData.quantity || 1, // Valor predeterminado
    features: initialData.features || {},
    notes: initialData.notes || ""
  });
  
  // Estados para listas y opciones
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  
  // Estado para características específicas
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  
  // Estados para funcionalidades adicionales
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandRenown, setNewBrandRenown] = useState("Normal"); // Valor por defecto
  
  // Estado para resultado de valuación
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Estado para detectar si es ropa
  const [isClothingCategory, setIsClothingCategory] = useState(false);
  const [clothingCategoryGroup, setClothingCategoryGroup] = useState(null);
  
  // Servicio de valuación
  const valuationService = new ValuationService();

  // Actualizar formData cuando cambie initialData
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData({
        category_id: initialData.category_id || "",
        subcategory_id: initialData.subcategory_id || "",
        status: initialData.status || "",
        brand_id: initialData.brand_id || "",
        brand_renown: initialData.brand_renown || "",
        modality: initialData.modality || "compra directa",
        condition_state: initialData.condition_state || "",
        demand: initialData.demand || "media",
        cleanliness: initialData.cleanliness || "buena",
        new_price: initialData.new_price || "",
        quantity: initialData.quantity || 1,
        features: initialData.features || {},
        notes: initialData.notes || "",
        // Preservar datos del formulario de ropa si existen
        clothingFormData: initialData.clothingFormData || null,
        isClothing: initialData.isClothing || false,
        suggested_purchase_price: initialData.suggested_purchase_price || null,
        suggested_sale_price: initialData.suggested_sale_price || null,
        store_credit_price: initialData.store_credit_price || null,
        consignment_price: initialData.consignment_price || null
      });
      
      // Si es ropa y tiene datos calculados, restaurar el resultado del cálculo
      if (initialData.isClothing && initialData.suggested_purchase_price) {
        setCalculationResult({
          purchase_score: 0,
          sale_score: 0,
          suggested_purchase_price: initialData.suggested_purchase_price,
          suggested_sale_price: initialData.suggested_sale_price,
          store_credit_price: initialData.store_credit_price,
          consignment_price: initialData.consignment_price
        });
      }
    }
  }, [initialData]);
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await valuationService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategories([]);
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
        setSubcategories(Array.isArray(data) ? data : []);
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
      setFeatureDefinitions([]);
      return;
    }
    
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        console.log('Obteniendo marcas para subcategoría:', formData.subcategory_id);
        const data = await valuationService.getBrands(Number(formData.subcategory_id));
        console.log('Marcas recibidas:', data);
        setBrands(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        setBrands([]);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    
    const fetchFeatureDefinitions = async () => {
      setIsLoadingFeatures(true);
      try {
        const data = await valuationService.getFeatureDefinitions(Number(formData.subcategory_id));
        setFeatureDefinitions(Array.isArray(data) ? data : []);
        
        // Inicializar valores de características
        const initialFeatures = {};
        if (Array.isArray(data)) {
          data.forEach(feature => {
            initialFeatures[feature.name] = '';
          });
        }
        
        // Actualizar formData con las características inicializadas
        setFormData(prev => ({
          ...prev,
          features: initialFeatures
        }));
      } catch (error) {
        console.error('Error al cargar definiciones de características:', error);
        setFeatureDefinitions([]);
      } finally {
        setIsLoadingFeatures(false);
      }
    };
    
    // Verificar si es categoría de ropa
    const checkIfClothing = async () => {
      try {
        const response = await clothingService.checkIfClothingCategory(Number(formData.subcategory_id));
        setIsClothingCategory(response.isClothing);
        setClothingCategoryGroup(response.categoryGroup);
      } catch (error) {
        console.error('Error checking if clothing category:', error);
        setIsClothingCategory(false);
        setClothingCategoryGroup(null);
      }
    };
    
    fetchBrands();
    fetchFeatureDefinitions();
    checkIfClothing();
  }, [formData.subcategory_id]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Extraer el nombre real del campo sin el ID del producto
    // El formato del nombre es "campo-productoId"
    const fieldNameParts = name.split('-');
    const fieldName = fieldNameParts[0]; // Tomamos solo la primera parte (el nombre del campo)
    
    console.log(`Campo cambiado: ${fieldName}, Valor: ${value}`);
    
    // Para categorías, subcategorías y marcas, asegurarse de que el valor sea numérico
    let processedValue = value;
    let newFormData = { ...formData };
    
    if (fieldName === 'category_id' || fieldName === 'subcategory_id' || fieldName === 'brand_id') {
      // Si es una cadena vacía, mantenerla así
      if (value !== '') {
        if (value === 'nueva' && fieldName === 'brand_id') {
          // Mostrar el formulario para agregar nueva marca
          setShowNewBrand(true);
          return;
        }
        processedValue = Number(value);
        
        // Si es una marca, establecer automáticamente el renombre
        if (fieldName === 'brand_id') {
          const selectedBrand = brands.find(brand => brand.id === processedValue);
          if (selectedBrand) {
            // Actualizar el renombre de marca automáticamente
            newFormData.brand_renown = selectedBrand.renown;
            console.log(`Renombre establecido automáticamente a: ${selectedBrand.renown}`);
          }
        }
      }
    }
    
    newFormData[fieldName] = processedValue;
    setFormData(newFormData);
    
    // Notificar cambios al componente padre
    onChange(newFormData);
  };
  
  // Manejar el guardado de una nueva marca
  const handleSaveNewBrand = async () => {
    if (!newBrandName.trim()) {
      alert('Por favor ingrese un nombre para la marca');
      return;
    }
    
    if (!formData.subcategory_id) {
      alert('Por favor seleccione una subcategoría primero');
      return;
    }
    
    try {
      // Crear objeto con los datos de la nueva marca
      const brandData = {
        name: newBrandName,
        subcategory_id: Number(formData.subcategory_id),
        renown: newBrandRenown
      };
      
      // Guardar la marca en la base de datos
      const newBrand = await valuationService.createBrand(brandData);
      console.log('Nueva marca guardada:', newBrand);
      
      // Agregar la nueva marca a la lista
      setBrands([...brands, newBrand]);
      
      // Seleccionar la nueva marca y establecer su renombre
      setFormData({
        ...formData,
        brand_id: newBrand.id,
        brand_renown: newBrand.renown
      });
      
      // Limpiar y cerrar el formulario
      setNewBrandName('');
      setNewBrandRenown('Normal');
      setShowNewBrand(false);
      
      // Notificar al usuario
      alert(`Marca "${newBrand.name}" creada exitosamente`);
    } catch (error) {
      console.error('Error al guardar nueva marca:', error);
      alert('Ocurrió un error al guardar la marca');
    }
  };
  
  // Manejar cambios en las características específicas
  const handleFeatureChange = (e) => {
    const { name, value } = e.target;
    
    // Extraer el nombre real de la característica sin el ID del producto
    // El formato del nombre es "característica-feature-productoId"
    const featureNameParts = name.split('-feature-');
    const featureName = featureNameParts[0]; // Tomamos solo la primera parte (el nombre de la característica)
    
    console.log(`Característica cambiada: ${featureName}, Valor: ${value}`);
    
    const newFeatures = { ...formData.features, [featureName]: value };
    const newFormData = { ...formData, features: newFeatures };
    
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
        condition_state: formData.condition_state,
        demand: formData.demand,
        cleanliness: formData.cleanliness,
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
  
  // Manejar envío del formulario de ropa
  const handleClothingSubmit = (clothingData) => {
    // Actualizar formData con los datos de ropa
    const updatedFormData = {
      ...formData,
      status: clothingData.status,
      brand_id: '', // En ropa no usamos brand_id, la marca va en features
      brand_renown: 'Normal', // Valor por defecto
      condition_state: clothingData.conditionState,
      demand: clothingData.demand,
      cleanliness: clothingData.cleanliness,
      new_price: clothingData.new_price,
      quantity: clothingData.quantity,
      features: clothingData.features,
      notes: clothingData.notes,
      // Agregar campos calculados
      isClothing: true,
      suggested_purchase_price: clothingData.suggestedPurchasePrice,
      suggested_sale_price: clothingData.suggestedSalePrice,
      store_credit_price: clothingData.storeCreditPrice,
      consignment_price: clothingData.consignmentPrice,
      // Mantener nombres para mostrar en el resumen
      categoryName: categories.find(c => c.id === Number(formData.category_id))?.name || '',
      subcategoryName: subcategories.find(s => s.id === Number(formData.subcategory_id))?.name || '',
      brandName: clothingData.features?.marca || 'Sin marca',
      // Guardar datos del formulario de ropa para re-hidratación
      clothingFormData: clothingData.clothingFormData
    };
    
    setFormData(updatedFormData);
    setCalculationResult({
      purchase_score: 0, // No aplica para ropa
      sale_score: 0, // No aplica para ropa
      suggested_purchase_price: clothingData.suggestedPurchasePrice,
      suggested_sale_price: clothingData.suggestedSalePrice,
      store_credit_price: clothingData.storeCreditPrice,
      consignment_price: clothingData.consignmentPrice
    });
    
    // Notificar al componente padre
    onChange(updatedFormData);
  };
  
  // Renderizar campos de características específicas
  const renderFeatureFields = () => {
    if (isLoadingFeatures) {
      return <div className="col-span-3 py-2 text-center">Cargando características...</div>;
    }
    
    if (featureDefinitions.length === 0) {
      return null;
    }
    
    return (
      <div className="col-span-3 mt-4 border-t border-border pt-4">
        <h3 className="text-lg font-medium mb-3 text-azul-profundo">Características Específicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureDefinitions.map((feature) => (
            <div key={feature.id} className="space-y-2">
              <label className="block font-medium" htmlFor={`${feature.name}-feature-${productoId}`}>
                {feature.display_name}
              </label>
              {feature.type === 'texto' && (
                <input
                  type="text"
                  id={`${feature.name}-feature-${productoId}`}
                  name={`${feature.name}-feature-${productoId}`}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  value={formData.features[feature.name] || ''}
                  onChange={handleFeatureChange}
                />
              )}
              {feature.type === 'numero' && (
                <input
                  type="number"
                  id={`${feature.name}-feature-${productoId}`}
                  name={`${feature.name}-feature-${productoId}`}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  value={formData.features[feature.name] || ''}
                  onChange={handleFeatureChange}
                />
              )}
              {feature.type === 'seleccion' && feature.options && (
                <select
                  id={`${feature.name}-feature-${productoId}`}
                  name={`${feature.name}-feature-${productoId}`}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  value={formData.features[feature.name] || ''}
                  onChange={handleFeatureChange}
                >
                  <option value="">Seleccionar opción</option>
                  {feature.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Si es categoría de ropa y ya se seleccionó subcategoría, mostrar mensaje
  if (isClothingCategory && formData.subcategory_id && clothingCategoryGroup) {
    return (
      <div className={`producto-form ${className} bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg`} data-index={index}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Categoría de Ropa Detectada
          </h3>
          <p className="text-gray-700 mb-4">
            Para agregar prendas de ropa, por favor use el botón <strong>"Agregar Ropa (Masivo)"</strong> 
            que permite ingresar múltiples prendas de forma eficiente.
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Eliminar este formulario
          </button>
        </div>
      </div>
    );
  }

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
                className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                value={formData.brand_id}
                onChange={handleChange}
                disabled={!formData.subcategory_id || isLoadingBrands}
              >
                <option value="">
                  {!formData.subcategory_id 
                    ? "Seleccione primero una subcategoría" 
                    : isLoadingBrands 
                      ? "Cargando marcas..." 
                      : brands.length > 0 
                        ? "Seleccionar marca"
                        : "No hay marcas disponibles"}
                </option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
                <option value="nueva">+ Agregar nueva marca</option>
              </select>
              <button 
                type="button"
                className="bg-azul-claro text-white px-3 rounded-md hover:bg-azul-claro/80 transition-all"
                onClick={() => setShowNewBrand(true)}
                disabled={!formData.subcategory_id}
              >
                +
              </button>
            </div>
            
            {showNewBrand && (
              <div className="mt-2 p-3 border border-border rounded-md bg-background">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor={`new-brand-${productoId}`}>
                    Nombre de la nueva marca
                  </label>
                  <input 
                    type="text" 
                    id={`new-brand-${productoId}`}
                    className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                  />
                  
                  <label className="text-sm font-medium mt-2" htmlFor={`new-brand-renown-${productoId}`}>
                    Renombre de la marca
                  </label>
                  <select
                    id={`new-brand-renown-${productoId}`}
                    className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                    value={newBrandRenown}
                    onChange={(e) => setNewBrandRenown(e.target.value)}
                  >
                    <option value="Sencilla">Sencilla</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Premium">Premium</option>
                  </select>
                  
                  <div className="flex gap-2 mt-2">
                    <button 
                      type="button"
                      className="bg-azul-claro text-white px-3 py-2 rounded-md hover:bg-azul-claro/80 transition-all"
                      onClick={handleSaveNewBrand}
                    >
                      Guardar
                    </button>
                    <button 
                      type="button"
                      className="bg-rosa text-white px-3 py-2 rounded-md hover:bg-rosa/80 transition-all"
                      onClick={() => {
                        setShowNewBrand(false);
                        setNewBrandName('');
                        setNewBrandRenown('Normal');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
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
              <option value="crédito en tienda">Crédito en tienda</option>
              <option value="consignación">Consignación</option>
            </select>
          </div>
        </div>
        
        {/* Sección 3: Estado, Demanda y Limpieza */}
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
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
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
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
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
              <option value="Buena">Buena</option>
              <option value="Regular">Regular</option>
              <option value="Mala">Mala</option>
            </select>
          </div>
        </div>
        
        {/* Sección 4: Precio, Cantidad y Notas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`new_price-${productoId}`}>
              Precio Nuevo <span className="text-rosa">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input 
                type="number" 
                id={`new_price-${productoId}`} 
                name={`new_price-${productoId}`} 
                className="w-full p-2 pl-6 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                required
                min="0"
                step="0.01"
                value={formData.new_price}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`quantity-${productoId}`}>
              Cantidad
            </label>
            <input 
              type="number" 
              id={`quantity-${productoId}`} 
              name={`quantity-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`notes-${productoId}`}>
              Notas
            </label>
            <textarea 
              id={`notes-${productoId}`} 
              name={`notes-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
        
        {/* Sección 5: Características específicas */}
        {renderFeatureFields()}
        
        {/* Sección 7: Cálculo y Resultados */}
        <div className="flex flex-col gap-4">
          <button 
            type="button"
            className="bg-azul-claro text-white py-2 px-4 rounded-md hover:bg-azul-claro/80 transition-all w-full md:w-auto"
            onClick={calculateValuation}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculando...' : 'Calcular Valuación'}
          </button>
          
          {calculationResult && (
            <div className="bg-amarillo/10 p-4 rounded-md border border-amarillo">
              <h3 className="text-lg font-medium mb-2 text-azul-profundo">Resultado de la Valuación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Puntaje de Compra: <span className="font-medium">{calculationResult.purchase_score}</span></p>
                  <p className="text-sm text-gray-600">Puntaje de Venta: <span className="font-medium">{calculationResult.sale_score}</span></p>
                </div>
                <div>
                  <p className="text-base">Precio de Compra: <span className="font-medium text-azul-profundo">${calculationResult.suggested_purchase_price.toFixed(2)}</span></p>
                  <p className="text-base">Precio de Venta: <span className="font-medium text-azul-profundo">${calculationResult.suggested_sale_price.toFixed(2)}</span></p>
                  {calculationResult.store_credit_price && (
                    <p className="text-base">Precio Crédito Tienda: <span className="font-medium text-verde-oscuro">${calculationResult.store_credit_price.toFixed(2)}</span></p>
                  )}
                  {calculationResult.consignment_price && (
                    <p className="text-base">Precio Consignación: <span className="font-medium text-amarillo">${calculationResult.consignment_price.toFixed(2)}</span></p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 