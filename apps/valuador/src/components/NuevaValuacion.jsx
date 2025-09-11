import React, { useState, useEffect, useContext } from 'react';
import { ProductoForm } from './ProductoForm';
import { ClienteForm } from './ClienteForm';
import OfertaDocument from './OfertaDocument';
import ContratoConsignacion from './ContratoConsignacion';
import { ValuationService } from '../services';
import { useAuth, AuthProvider, AuthContext } from '../context/AuthContext';
import ClothingBulkForm from './ClothingBulkForm';
import ClothingBulkProductDisplay from './ClothingBulkProductDisplay';

// En un proyecto Astro puedes importar el layout directamente o usar un componente Layout React
// Para este ejemplo, asumimos que estamos usando la integración de React en Astro

// Componente interno que usa el contexto
function NuevaValuacionContent() {
  console.log('📝 NuevaValuacionContent: Componente renderizándose...');
  console.log('📝 Entorno de navegador:', typeof window !== 'undefined');
  
  // DIAGNÓSTICO AUTOMÁTICO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 === DIAGNÓSTICO AUTOMÁTICO - NUEVA VALUACION ===');
      console.log('🔍 LocalStorage disponible:', typeof localStorage !== 'undefined');
      
      const rawToken = localStorage.getItem('entrepeques_auth_token');
      const rawUser = localStorage.getItem('entrepeques_user');
      
      console.log('🔍 Raw token en localStorage:', rawToken ? `${rawToken.substring(0, 30)}...` : 'NULL');
      console.log('🔍 Raw user en localStorage:', rawUser ? rawUser.substring(0, 100) + '...' : 'NULL');
      
      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          console.log('🔍 Usuario parseado:', parsedUser.username, '| ID:', parsedUser.id);
        } catch (e) {
          console.error('🔍 Error parseando usuario:', e);
        }
      }
      console.log('🔍 === FIN DIAGNÓSTICO - NUEVA VALUACION ===');
    }
  }, []);

  // Estado de autenticación
  const authContext = useAuth();
  const { isAuthenticated, user, isLoading: authLoading } = authContext;
  
  console.log('📝 NuevaValuacionContent: Contexto completo:', authContext);
  console.log('📝 NuevaValuacionContent: useAuth resultado:', { 
    isAuthenticated, 
    user: user?.username || 'null', 
    authLoading,
    userObject: user 
  });

  // Estado para la valuación
  const [valuation, setValuation] = useState(null);
  const [isCreatingValuation, setIsCreatingValuation] = useState(false);
  const [isFinalizingValuation, setIsFinalizingValuation] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);

  // Estado para cliente
  const [client, setClient] = useState({
    name: '',
    phone: '',
    email: '',
    identification: ''
  });

  // Estado para los productos
  const [products, setProducts] = useState([{ id: Date.now(), data: {} }]);

  // Estado para el resumen
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalPurchaseValue: 0,
    totalSaleValue: 0,
    totalConsignmentValue: 0,
    productDetails: []
  });

  // Estado para productos seleccionados en el resumen
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // Estado para precios editados en el resumen
  const [editedPrices, setEditedPrices] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);

  // Estado para modalidades editadas en el resumen
  const [editedModalities, setEditedModalities] = useState({});

  // Estado para mostrar documento de oferta
  const [showOfferDocument, setShowOfferDocument] = useState(false);
  
  // Estado para mostrar contrato de consignación
  const [showConsignmentContract, setShowConsignmentContract] = useState(false);
  
  // Estado para mostrar formulario masivo de ropa
  const [showClothingBulkForm, setShowClothingBulkForm] = useState(false);
  const [selectedClothingCategory, setSelectedClothingCategory] = useState(null);

  // Estado para error
  const [error, setError] = useState(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Fecha actual formateada
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Instanciar servicio de valuación
  const valuationService = new ValuationService();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    console.log('📝 Estado de autenticación en NuevaValuacion:', { isAuthenticated, user: user?.username, authLoading });

    if (isAuthenticated && !authLoading) {
      console.log('📝 Usuario autenticado en NuevaValuacion:', user?.username);
      // Actualizar el token en el servicio de valuación
      valuationService.refreshAuthToken();

      // Limpiar cualquier error de autenticación previo
      if (error && error.includes('iniciar sesión')) {
        setError(null);
      }
    } else if (!isAuthenticated && !authLoading) {
      console.warn('📝 Usuario no autenticado en NuevaValuacion');
      setError('Debe iniciar sesión para utilizar esta funcionalidad');
      showNotification('Debe iniciar sesión para utilizar esta funcionalidad', 'error');
    }
  }, [isAuthenticated, user, authLoading]);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });

    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Funciones para manejo de selección de productos
  const handleProductSelection = (productId, isSelected) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(productId);
      } else {
        newSelected.delete(productId);
      }
      
      // Actualizar el estado de "Seleccionar todos"
      setSelectAll(newSelected.size === summary.productDetails.length);
      
      return newSelected;
    });
  };

  const handleSelectAll = (shouldSelectAll) => {
    setSelectAll(shouldSelectAll);
    if (shouldSelectAll) {
      const allProductIds = new Set(summary.productDetails.map(product => product.id));
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Calcular totales de productos seleccionados (considerando precios editados)
  const calculateSelectedTotals = () => {
    const selectedProductList = summary.productDetails.filter(product => 
      selectedProducts.has(product.id)
    );

    const totalPurchase = selectedProductList.reduce((sum, item) => {
      // Usar precio editado si existe, sino el precio sugerido
      const editedPrice = editedPrices[item.id];
      const price = editedPrice?.purchase !== undefined 
        ? Number(editedPrice.purchase)
        : (item.suggested_purchase_price ? Number(item.suggested_purchase_price) : 0);
      const quantity = Number(item.quantity) || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);

    const totalSale = selectedProductList.reduce((sum, item) => {
      // Usar precio editado si existe, sino el precio sugerido
      const editedPrice = editedPrices[item.id];
      const price = editedPrice?.sale !== undefined 
        ? Number(editedPrice.sale)
        : (item.suggested_sale_price ? Number(item.suggested_sale_price) : 0);
      const quantity = Number(item.quantity) || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);

    const totalConsignment = selectedProductList.reduce((sum, item) => {
      // Usar modalidad editada si existe, sino la original
      const finalModality = editedModalities[item.id] || item.modality;
      if (finalModality !== 'consignación') return sum;
      const price = item.consignment_price ? Number(item.consignment_price) : 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);

    return {
      count: selectedProductList.length,
      totalPurchase: Number(totalPurchase) || 0,
      totalSale: Number(totalSale) || 0,
      totalConsignment: Number(totalConsignment) || 0
    };
  };

  // Funciones para editar precios
  const startEditingPrice = (productId) => {
    setEditingProduct(productId);
  };

  const cancelEditingPrice = () => {
    setEditingProduct(null);
  };

  const saveEditedPrice = (productId, purchasePrice, salePrice) => {
    setEditedPrices(prev => ({
      ...prev,
      [productId]: {
        purchase: Number(purchasePrice) || 0,
        sale: Number(salePrice) || 0
      }
    }));
    setEditingProduct(null);
  };

  // Manejar cambio de modalidad
  const handleModalityChange = (productId, newModality) => {
    setEditedModalities(prev => ({
      ...prev,
      [productId]: newModality
    }));

    // Actualizar precios automáticamente según la modalidad
    const product = summary.productDetails.find(p => p.id === productId);
    if (!product) return;

    const currentEditedPrice = editedPrices[productId];
    const basePurchasePrice = currentEditedPrice?.purchase !== undefined 
      ? currentEditedPrice.purchase 
      : (product.suggested_purchase_price || 0);
    const originalPrice = product.suggested_purchase_price || 0;

    if (newModality === 'consignación') {
      // En consignación, el proveedor recibe 50% del precio de venta real
      // No modificamos el precio aquí ya que se calculará al momento de la venta
      // Solo mantenemos el precio sugerido de venta
      setEditedPrices(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          // Mantener el precio de venta sugerido sin cambios
          purchase: product.suggested_sale_price || originalPrice
        }
      }));
    } else if (newModality === 'crédito en tienda') {
      // Al cambiar a crédito en tienda, aumentar precio de compra en 20%
      const newPurchasePrice = originalPrice * 1.2;
      setEditedPrices(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          purchase: newPurchasePrice
        }
      }));
    } else if (newModality === 'compra directa') {
      // Al cambiar a compra directa, restaurar precio original
      setEditedPrices(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          purchase: originalPrice
        }
      }));
    }
  };

  // Obtener modalidad final (editada o original)
  const getFinalModality = (product) => {
    return editedModalities[product.id] || product.modality;
  };

  // Obtener precio final (editado o sugerido)
  const getFinalPrice = (product, type) => {
    const editedPrice = editedPrices[product.id];
    let price = 0;
    
    if (type === 'purchase') {
      price = editedPrice?.purchase !== undefined 
        ? editedPrice.purchase 
        : (product.suggested_purchase_price || 0);
    } else if (type === 'sale') {
      price = editedPrice?.sale !== undefined 
        ? editedPrice.sale 
        : (product.suggested_sale_price || 0);
    }
    
    // Asegurar que siempre devolvemos un número válido
    const numericPrice = Number(price);
    const finalPrice = isNaN(numericPrice) ? 0 : numericPrice;
    
    return finalPrice;
  };

  // Cache para las definiciones de características de oferta por subcategoría
  const [offerFeatureCache, setOfferFeatureCache] = useState({});

  // Obtener definiciones de características para ofertas
  const getOfferFeatureDefinitions = async (subcategoryId) => {
    // Verificar si ya está en cache
    if (offerFeatureCache[subcategoryId]) {
      return offerFeatureCache[subcategoryId];
    }

    try {
      const response = await valuationService.getOfferFeatures(subcategoryId);
      if (response.ok) {
        const result = await response.json();
        const features = result.data || [];
        
        // Guardar en cache
        setOfferFeatureCache(prev => ({
          ...prev,
          [subcategoryId]: features
        }));
        
        return features;
      }
    } catch (error) {
      console.error('Error al obtener definiciones de características para oferta:', error);
    }
    
    return [];
  };

  // Generar descripción descriptiva del producto usando database-driven features
  const getProductDescription = (product, index) => {
    const parts = [];
    
    // 1. Obtener nombre de subcategoría/categoría (el backend debe proporcionarlos)
    const subcategoryName = product.subcategoryName || product.subcategory_name;
    const categoryName = product.categoryName || product.category_name;
    
    // Determinar qué nombre usar
    if (subcategoryName && subcategoryName.trim()) {
      parts.push(subcategoryName);
    } else if (categoryName && categoryName.trim()) {
      parts.push(categoryName);
    } else {
      parts.push('Artículo');
    }
    
    // 2. Características importantes basadas en database (offer_print=TRUE)
    if (product.features && typeof product.features === 'object' && product.subcategory_id) {
      // Para optimizar, usar un approach sincrónico basado en reglas conocidas
      // ya que no podemos hacer llamadas async en esta función de render
      const importantFeatures = [];
      
      // Aplicar las mismas reglas que definimos en la migración
      const importantFields = ['modelo', 'talla', 'edad', 'tipo', 'tamano', 'color', 'size'];
      
      importantFields.forEach(fieldName => {
        if (product.features[fieldName]) {
          let value = product.features[fieldName];
          
          // Formatear valores especiales
          if (fieldName === 'talla' || fieldName === 'size') {
            value = `Talla ${value}`;
          } else if (fieldName === 'edad') {
            value = `${value}`;
          }
          
          importantFeatures.push(value);
        }
      });
      
      // Limitar a las 2 características más importantes
      if (importantFeatures.length > 0) {
        parts.push(importantFeatures.slice(0, 2).join(', '));
      }
    }
    
    // 3. Marca (si está disponible y no es genérica) - después de características
    const brandName = product.brandName || product.brand_name || product.brand?.name;
    if (brandName && 
        brandName !== 'Sin marca' && 
        brandName !== 'Genérica' &&
        brandName !== 'sin marca' &&
        brandName !== 'genérica' &&
        brandName.toLowerCase() !== 'sin marca' &&
        brandName.toLowerCase() !== 'genérica') {
      parts.push(brandName);
    }
    
    // 4. Estado/condición de manera concisa (solo para productos usados)
    if (product.status && product.status.toLowerCase() === 'usado' && product.condition_state) {
      const conditionMap = {
        'excelente': 'Estado Excelente',
        'bueno': 'Buen Estado',
        'regular': 'Estado Regular',
        'malo': 'Estado Deteriorado'
      };
      
      const conditionText = conditionMap[product.condition_state?.toLowerCase()] || product.condition_state;
      parts.push(conditionText);
    }
    
    return parts.join(' - ');
  };

  // Manejar cambios en el formulario de cliente
  const handleClientChange = (clientData) => {
    setClient(clientData);
  };

  // Agregar un nuevo producto
  const addProduct = () => {
    setProducts(prev => [...prev, { id: Date.now(), data: {} }]);
  };

  // Eliminar un producto
  const removeProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Actualizar datos de un producto
  const updateProductData = (id, data) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, data }
          : product
      )
    );
  };

  // Manejar productos masivos de ropa
  const handleBulkClothingProducts = (clothingProducts) => {
    // Crear un producto para cada combinación de calidad-talla
    const newProducts = clothingProducts.map((product, index) => ({
      id: Date.now() + index,
      data: {
        ...product,
        category_id: selectedClothingCategory?.categoryId,
        subcategory_id: product.subcategory_id,
        status: product.status || 'Usado como nuevo',
        brand_id: null,
        brand_renown: product.brand_renown || 'Normal',
        modality: product.modality || 'compra directa',
        condition_state: product.condition_state || 'Bueno',
        demand: product.demand || 'Media',
        cleanliness: product.cleanliness || 'Buena',
        new_price: product.suggested_sale_price, // Usar precio de venta como referencia
        quantity: product.quantity,
        features: {
          tipo: product.garmentType,
          talla: product.size,
          marca: product.brand || 'ropa',
          color: product.color || 'NA',
          calidad: product.qualityLevel
        },
        notes: `Prenda: ${product.garmentType}, Calidad: ${product.qualityLevel}, Talla: ${product.size}`,
        isClothing: true,
        // Precios ya calculados
        suggested_purchase_price: product.purchase_price,
        suggested_sale_price: product.suggested_sale_price,
        store_credit_price: product.store_credit_price,
        consignment_price: product.consignment_price
      },
      prices: {
        suggested_purchase_price: product.purchase_price,
        suggested_sale_price: product.suggested_sale_price,
        store_credit_price: product.store_credit_price,
        consignment_price: product.consignment_price,
        final_purchase_price: product.purchase_price,
        final_sale_price: product.suggested_sale_price
      },
      // Marcar como producto de ropa para manejo especial
      isClothingBulk: true
    }));

    // Agregar todos los productos al estado
    setProducts(prev => [...prev, ...newProducts]);
    
    // Cerrar el formulario masivo
    setShowClothingBulkForm(false);
    setSelectedClothingCategory(null);
    
    // Mostrar notificación
    setNotification({
      type: 'success',
      message: `Se agregaron ${newProducts.length} prendas de ropa exitosamente`
    });
    
    // Limpiar notificación después de 3 segundos
    setTimeout(() => setNotification(null), 3000);
  };

  // Crear valuación en el servidor
  const createValuation = async () => {
    if (!client.name || !client.phone) {
      setError('Por favor complete al menos el nombre y teléfono del cliente');
      return;
    }

    setIsCreatingValuation(true);
    setError(null);

    try {
      // 1. Crear o buscar cliente
      let clientResponse;

      if (client.id) {
        // Cliente existente, usar el ID
        clientResponse = await valuationService.getClient(client.id);
        console.log('Cliente existente encontrado:', clientResponse);
      } else {
        // Nuevo cliente, crear
        console.log('Creando nuevo cliente:', {
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          identification: client.identification || ''
        });

        clientResponse = await valuationService.createClient({
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          identification: client.identification || ''
        });

        console.log('Cliente creado:', clientResponse);

        // Actualizar el estado del cliente con el ID asignado
        setClient(prevClient => ({
          ...prevClient,
          id: clientResponse.id
        }));
      }

      // 2. Crear valuación
      console.log('Creando valuación para cliente:', clientResponse.id);

      const valuationResponse = await valuationService.createValuation({
        client_id: clientResponse.id,
        notes: ''
      });

      console.log('Valuación creada:', valuationResponse);
      setValuation(valuationResponse);
      showNotification('Valuación creada correctamente');
      return valuationResponse;
    } catch (error) {
      console.error('Error al crear valuación:', error);
      setError('Error al crear la valuación. Por favor intente nuevamente.');
      showNotification('Error al crear la valuación', 'error');
      return null;
    } finally {
      setIsCreatingValuation(false);
    }
  };

  // Generar resumen de valuación
  const generateSummary = async () => {
    if (!client.name || !client.phone) {
      setError('Por favor complete al menos el nombre y teléfono del cliente');
      return;
    }

    // Validar que haya al menos un producto con datos completos
    const validProducts = products.filter(p =>
      p.data.subcategory_id &&
      p.data.status &&
      p.data.condition_state &&
      p.data.new_price
    );

    if (validProducts.length === 0) {
      setError('Por favor complete los datos de al menos un producto');
      return;
    }

    setError(null);
    setIsAddingItems(true);

    try {
      // Separar productos de ropa de productos regulares
      const clothingProducts = validProducts.filter(p => p.data.isClothing === true);
      const regularProducts = validProducts.filter(p => p.data.isClothing !== true);

      let calculatedProducts = [];

      // Procesar productos regulares con el endpoint de cálculo batch
      if (regularProducts.length > 0) {
        const productsForCalculation = regularProducts.map(product => ({
          category_id: Number(product.data.category_id),
          subcategory_id: Number(product.data.subcategory_id),
          brand_id: product.data.brand_id ? Number(product.data.brand_id) : null,
          status: product.data.status,
          brand_renown: product.data.brand_renown || 'Normal',
          modality: product.data.modality || 'compra directa',
          condition_state: product.data.condition_state || 'bueno',
          demand: product.data.demand || 'media',
          cleanliness: product.data.cleanliness || 'buena',
          new_price: Number(product.data.new_price),
          quantity: Number(product.data.quantity) || 1,
          features: product.data.features || {},
          notes: product.data.notes || '',
          images: product.data.images || [],
          // Mantener nombres del formulario para compatibilidad
          categoryName: product.data.categoryName,
          subcategoryName: product.data.subcategoryName,
          brandName: product.data.brandName
        }));

        console.log('Calculando precios para productos regulares:', productsForCalculation);
        const batchCalculated = await valuationService.calculateBatch(productsForCalculation);
        calculatedProducts.push(...batchCalculated);
      }

      // Procesar productos de ropa (ya tienen precios calculados)
      if (clothingProducts.length > 0) {
        const clothingCalculated = clothingProducts.map((product, index) => ({
          // Generar un ID temporal único para el producto
          id: `clothing-${Date.now()}-${index}`,
          category_id: Number(product.data.category_id),
          subcategory_id: Number(product.data.subcategory_id),
          brand_id: null, // Ropa no usa brand_id
          status: product.data.status,
          brand_renown: 'Normal',
          modality: product.data.modality || 'compra directa',
          condition_state: product.data.condition_state,
          demand: product.data.demand,
          cleanliness: product.data.cleanliness,
          new_price: Number(product.data.new_price),
          quantity: Number(product.data.quantity) || 1,
          features: product.data.features || {},
          notes: product.data.notes || '',
          images: product.data.images || [],
          // Usar los precios ya calculados del formulario de ropa
          suggested_purchase_price: product.data.suggested_purchase_price,
          suggested_sale_price: product.data.suggested_sale_price,
          store_credit_price: product.data.store_credit_price,
          consignment_price: product.data.consignment_price,
          // Mantener nombres del formulario
          categoryName: product.data.categoryName,
          subcategoryName: product.data.subcategoryName,
          brandName: product.data.features?.marca || 'Sin marca',
          // Marcar como producto de ropa
          isClothing: true
        }));

        console.log('Productos de ropa con precios pre-calculados:', clothingCalculated);
        calculatedProducts.push(...clothingCalculated);
      }

      console.log('Todos los productos calculados:', calculatedProducts);

      // Calcular totales (multiplicar por cantidad)
      const totalPurchase = calculatedProducts.reduce((sum, item) => {
        const price = item.suggested_purchase_price ? Number(item.suggested_purchase_price) : 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (isNaN(price) ? 0 : price * quantity);
      }, 0);

      const totalSale = calculatedProducts.reduce((sum, item) => {
        const price = item.suggested_sale_price ? Number(item.suggested_sale_price) : 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (isNaN(price) ? 0 : price * quantity);
      }, 0);

      const totalConsignment = calculatedProducts.reduce((sum, item) => {
        // Usar modalidad editada si existe, sino la original
        const finalModality = editedModalities[item.id] || item.modality;
        if (finalModality !== 'consignación') return sum;
        const price = item.consignment_price ? Number(item.consignment_price) : 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (isNaN(price) ? 0 : price * quantity);
      }, 0);

      console.log('Calculated totals:', {
        totalPurchase,
        totalSale,
        totalConsignment,
        itemsCount: calculatedProducts.length
      });

      setSummary({
        totalProducts: calculatedProducts.length,
        totalPurchaseValue: Number(totalPurchase) || 0,
        totalSaleValue: Number(totalSale) || 0,
        totalConsignmentValue: Number(totalConsignment) || 0,
        productDetails: calculatedProducts
      });

      // Inicializar todos los productos como seleccionados
      const allProductIds = new Set(calculatedProducts.map(product => product.id));
      setSelectedProducts(allProductIds);
      setSelectAll(true);

      // Limpiar precios editados al regenerar resumen
      setEditedPrices({});
      setEditingProduct(null);
      setEditedModalities({});

      setShowSummary(true);
      showNotification(`Resumen generado con ${calculatedProducts.length} productos`);
    } catch (error) {
      console.error('Error al generar resumen:', error);
      setError('Error al generar el resumen. Por favor intente nuevamente.');
      showNotification('Error al generar el resumen', 'error');
    } finally {
      setIsAddingItems(false);
    }
  };

  // Imprimir oferta
  const printOffer = () => {
    // Validar que haya al menos un producto seleccionado
    if (selectedProducts.size === 0) {
      setError('Debe seleccionar al menos un producto para imprimir la oferta');
      showNotification('Debe seleccionar al menos un producto para imprimir la oferta', 'error');
      return;
    }

    // Validar que el cliente tenga datos básicos
    if (!client.name || !client.phone) {
      setError('Debe completar al menos el nombre y teléfono del cliente para imprimir la oferta');
      showNotification('Debe completar los datos básicos del cliente', 'error');
      return;
    }

    // Contar productos que aparecen en la oferta (compra directa y crédito en tienda)
    const offerProducts = summary.productDetails.filter(product => 
      selectedProducts.has(product.id) && 
      (getFinalModality(product) === 'compra directa' || getFinalModality(product) === 'crédito en tienda')
    );

    const consignmentProducts = summary.productDetails.filter(product => 
      selectedProducts.has(product.id) && 
      getFinalModality(product) === 'consignación'
    );

    // Validar que haya al menos un producto para la oferta
    if (offerProducts.length === 0) {
      setError('No hay productos para incluir en la oferta. Solo productos de "compra directa" y "crédito en tienda" aparecen en la oferta.');
      showNotification('No hay productos válidos para incluir en la oferta', 'error');
      return;
    }

    // Mostrar advertencia si hay productos en consignación
    if (consignmentProducts.length > 0) {
      const confirmed = window.confirm(
        `La oferta incluirá ${offerProducts.length} producto(s) (compra directa y crédito en tienda).\n\n` +
        `${consignmentProducts.length} producto(s) en consignación NO aparecerán en la oferta impresa.\n\n` +
        `¿Desea continuar?`
      );
      if (!confirmed) {
        return;
      }
    }

    // Mostrar el documento de oferta en el modal
    setShowOfferDocument(true);
    
    // Limpiar cualquier error previo
    setError(null);
  };

  // Imprimir contrato de consignación
  const printConsignmentContract = () => {
    // Filtrar solo productos en consignación que estén seleccionados
    const consignmentProducts = summary.productDetails.filter(product => 
      selectedProducts.has(product.id) && 
      getFinalModality(product) === 'consignación'
    );
    
    // Validar que haya productos en consignación
    if (consignmentProducts.length === 0) {
      setError('No hay productos en consignación para generar el contrato');
      showNotification('No hay productos en consignación', 'error');
      return;
    }
    
    // Validar datos del cliente
    if (!client.name || !client.phone) {
      setError('Debe completar al menos el nombre y teléfono del cliente para generar el contrato');
      showNotification('Complete los datos del cliente', 'error');
      return;
    }
    
    // Mostrar el contrato de consignación
    setShowConsignmentContract(true);
    
    // Limpiar errores
    setError(null);
  };

  // Finalizar valuación
  const finalizeValuation = async (e) => {
    e.preventDefault();

    if (!client.name || !client.phone) {
      setError('Se requieren los datos básicos del cliente para finalizar');
      showNotification('Se requieren los datos básicos del cliente', 'error');
      return;
    }

    // Validar que haya al menos un producto seleccionado
    if (selectedProducts.size === 0) {
      setError('Debe seleccionar al menos un producto para finalizar la valuación');
      showNotification('Debe seleccionar al menos un producto para finalizar la valuación', 'error');
      return;
    }

    // Mostrar confirmación si hay productos deseleccionados
    const unselectedCount = summary.productDetails.length - selectedProducts.size;
    if (unselectedCount > 0) {
      const confirmed = window.confirm(
        `Está a punto de finalizar la valuación con ${selectedProducts.size} productos seleccionados. ` +
        `${unselectedCount} producto(s) no se incluirán en la finalización. ¿Desea continuar?`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsFinalizingValuation(true);
    setError(null);

    try {
      // 1. Asegurar que el cliente existe
      let clientId = client.id;
      
      if (!clientId) {
        console.log('Creando cliente antes de finalizar valuación');
        const clientResponse = await valuationService.createClient({
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          identification: client.identification || ''
        });
        clientId = clientResponse.id;
        console.log('Cliente creado con ID:', clientId);
      }

      // 2. Preparar productos seleccionados con precios/modalidades editados
      const selectedProductsData = summary.productDetails
        .filter(product => selectedProducts.has(product.id))
        .map(product => {
          const editedPrice = editedPrices[product.id];
          const editedModality = editedModalities[product.id];
          
          // Para productos de ropa, asegurar que se incluyan los precios calculados
          if (product.isClothing) {
            return {
              category_id: product.category_id,
              subcategory_id: product.subcategory_id,
              brand_id: null, // Ropa no usa brand_id
              status: product.status,
              brand_renown: product.brand_renown,
              modality: editedModality || product.modality,
              condition_state: product.condition_state,
              demand: product.demand,
              cleanliness: product.cleanliness,
              new_price: product.new_price,
              quantity: product.quantity || 1,
              features: product.features || {},
              notes: product.notes || '',
              images: product.images || [],
              // Usar precios editados si existen, sino usar los pre-calculados
              final_purchase_price: editedPrice?.purchase || product.suggested_purchase_price,
              final_sale_price: editedPrice?.sale || product.suggested_sale_price,
              // Marcar como producto de ropa
              isClothing: true
            };
          }
          
          // Para productos regulares
          return {
            category_id: product.category_id,
            subcategory_id: product.subcategory_id,
            brand_id: product.brand_id || null,
            status: product.status,
            brand_renown: product.brand_renown,
            modality: editedModality || product.modality,
            condition_state: product.condition_state,
            demand: product.demand,
            cleanliness: product.cleanliness,
            new_price: product.new_price,
            quantity: product.quantity || 1,
            features: product.features || {},
            notes: product.notes || '',
            images: product.images || [],
            // Incluir precios editados si existen
            final_purchase_price: editedPrice?.purchase,
            final_sale_price: editedPrice?.sale
          };
        });

      const notes = unselectedCount > 0 ? 
        `Finalizada con ${selectedProducts.size} productos seleccionados de ${summary.productDetails.length} valuados` : 
        '';

      console.log('Finalizando valuación completa:', {
        clientId,
        productsCount: selectedProductsData.length,
        notes
      });

      // 3. Usar el nuevo endpoint que crea todo en una transacción
      const finalizedValuation = await valuationService.finalizeComplete(clientId, selectedProductsData, notes);

      console.log('Valuación finalizada con éxito:', finalizedValuation);
      showNotification(`Valuación finalizada con éxito. ${selectedProducts.size} productos incluidos.`);

      // Redirigir al historial
      setTimeout(() => {
        window.location.href = '/historial';
      }, 2000);
    } catch (error) {
      console.error('Error al finalizar valuación:', error);
      setError('Error al finalizar la valuación. Por favor intente nuevamente.');
      showNotification('Error al finalizar la valuación', 'error');
    } finally {
      setIsFinalizingValuation(false);
    }
  };

  // Renderizar el resumen de valuación
  const renderSummary = () => {
    if (!showSummary) return null;

    const selectedTotals = calculateSelectedTotals();

    return (
      <div className="bg-background-alt p-6 rounded-lg shadow-md border border-border mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-heading font-bold text-azul-profundo">Resumen de Valuación</h2>
          <div className="text-sm text-gray-600">
            {selectedProducts.size} de {summary.totalProducts} productos seleccionados
          </div>
        </div>

        {/* Información sobre la funcionalidad */}
        <div className="bg-azul-claro/10 border border-azul-claro/30 p-4 rounded-md mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-azul-claro mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-azul-profundo font-medium">Personalice su valuación final</p>
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                <p>• <strong>Compra directa:</strong> Pago inmediato en efectivo</p>
                <p>• <strong>Crédito en tienda:</strong> Pago +20% en vales de tienda</p>
                <p>• <strong>Consignación:</strong> El proveedor recibe 50% del precio de venta cuando se venda el producto</p>
                <p>• Use el botón ✏️ para editar precios individualmente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de totales - ahora muestran totales de productos seleccionados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-background rounded-md">
          <div className="text-center p-3 border border-border rounded-md bg-azul-claro/5">
            <p className="text-sm text-gray-600">Productos Seleccionados</p>
            <p className="text-2xl font-bold text-azul-profundo">{selectedTotals.count}</p>
            <p className="text-xs text-gray-500">de {summary.totalProducts} total</p>
          </div>

          <div className="text-center p-3 border border-border rounded-md bg-verde-lima/5">
            <p className="text-sm text-gray-600">Valor de Compra Seleccionado</p>
            <p className="text-2xl font-bold text-verde-oscuro">
              ${selectedTotals.totalPurchase.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Total: ${summary.totalPurchaseValue.toFixed(2)}
            </p>
          </div>

          <div className="text-center p-3 border border-border rounded-md bg-amarillo/5">
            <p className="text-sm text-gray-600">Valor de Venta Seleccionado</p>
            <p className="text-2xl font-bold text-azul-profundo">
              ${selectedTotals.totalSale.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Total: ${summary.totalSaleValue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background-alt border-b border-border">
                <th className="p-2 text-left w-12">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-azul-claro border-gray-300 rounded focus:ring-azul-claro focus:ring-2"
                    />
                    <span className="sr-only">Seleccionar todos</span>
                  </label>
                </th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Modalidad</th>
                <th className="p-2 text-center">Cantidad</th>
                <th className="p-2 text-right">Precio Unit. Compra</th>
                <th className="p-2 text-right">Precio Unit. Venta</th>
                <th className="p-2 text-right">Total Compra</th>
                <th className="p-2 text-right">Consignación<br/><span className="text-xs font-normal">(50% venta)</span></th>
                <th className="p-2 text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {summary.productDetails.map((product, index) => {
                const isSelected = selectedProducts.has(product.id);
                const isEditing = editingProduct === product.id;
                
                // Verificar que los precios del producto sean válidos
                const safePurchasePrice = Number(product.suggested_purchase_price) || 0;
                const safeSalePrice = Number(product.suggested_sale_price) || 0;
                
                const finalPurchasePrice = getFinalPrice(product, 'purchase');
                const finalSalePrice = getFinalPrice(product, 'sale');
                
                return (
                  <tr 
                    key={product.id} 
                    className={`
                      ${index % 2 === 0 ? 'bg-background' : 'bg-background-alt'} 
                      ${!isSelected ? 'opacity-50' : ''} 
                      transition-opacity duration-200
                    `}
                  >
                    <td className="p-2 border-b border-border">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                          className="w-4 h-4 text-azul-claro border-gray-300 rounded focus:ring-azul-claro focus:ring-2"
                        />
                        <span className="sr-only">Seleccionar producto</span>
                      </label>
                    </td>
                    <td className="p-2 border-b border-border">
                      <div className="font-medium">{getProductDescription(product, index)}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>Demanda: {product.demand || 'N/A'}</span>
                        {product.new_price && (
                          <span className="text-azul-claro">• Precio nuevo: ${Number(product.new_price).toFixed(2)}</span>
                        )}
                      </div>
                      {!isSelected && (
                        <div className="text-xs text-rosa italic mt-1">No incluido en la valuación final</div>
                      )}
                      {editedPrices[product.id] && (
                        <div className="text-xs text-verde-oscuro italic mt-1">✓ Precio personalizado</div>
                      )}
                      {editedModalities[product.id] && (
                        <div className="text-xs text-azul-claro italic mt-1">🔄 Modalidad modificada: {editedModalities[product.id]}</div>
                      )}
                    </td>
                    
                    {/* Modalidad */}
                    <td className="p-2 text-center border-b border-border">
                      <select
                        value={getFinalModality(product)}
                        onChange={(e) => handleModalityChange(product.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-azul-claro focus:border-azul-claro"
                      >
                        <option value="compra directa">Compra directa</option>
                        <option value="crédito en tienda">Crédito en tienda</option>
                        <option value="consignación">Consignación</option>
                      </select>
                    </td>
                    
                    {/* Cantidad */}
                    <td className="p-2 text-center border-b border-border font-medium">
                      {product.quantity || 1}
                    </td>
                    
                    {/* Precio Unitario de Compra */}
                    <td className="p-2 text-right border-b border-border font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={finalPurchasePrice || 0}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:ring-azul-claro focus:border-azul-claro"
                          id={`purchase-${product.id}`}
                        />
                      ) : (
                        <span className={editedPrices[product.id] ? 'text-verde-oscuro font-bold' : ''}>
                          ${typeof finalPurchasePrice === 'number' ? finalPurchasePrice.toFixed(2) : '0.00'}
                        </span>
                      )}
                    </td>
                    
                    {/* Precio de Venta */}
                    <td className="p-2 text-right border-b border-border font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={finalSalePrice || 0}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:ring-azul-claro focus:border-azul-claro"
                          id={`sale-${product.id}`}
                        />
                      ) : (
                        <span className={editedPrices[product.id] ? 'text-verde-oscuro font-bold' : ''}>
                          ${typeof finalSalePrice === 'number' ? finalSalePrice.toFixed(2) : '0.00'}
                        </span>
                      )}
                    </td>
                    
                    {/* Total Compra */}
                    <td className="p-2 text-right border-b border-border font-medium text-verde-oscuro font-bold">
                      ${(finalPurchasePrice * (product.quantity || 1)).toFixed(2)}
                    </td>
                    
                    {/* Consignación */}
                    <td className="p-2 text-right border-b border-border font-medium">
                      {getFinalModality(product) === 'consignación'
                        ? (
                          <div>
                            <div className="text-xs text-gray-500">Precio sugerido:</div>
                            <div>${(product.suggested_sale_price * (product.quantity || 1)).toFixed(2)}</div>
                            <div className="text-xs text-verde-oscuro font-bold">Recibirá 50% al venderse</div>
                          </div>
                        )
                        : '-'
                      }
                    </td>
                    
                    {/* Acciones */}
                    <td className="p-2 text-center border-b border-border">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => {
                              const purchaseInput = document.getElementById(`purchase-${product.id}`);
                              const saleInput = document.getElementById(`sale-${product.id}`);
                              saveEditedPrice(product.id, purchaseInput.value, saleInput.value);
                            }}
                            className="px-2 py-1 text-xs bg-verde-lima text-white rounded hover:bg-verde-oscuro transition-colors"
                            title="Guardar cambios"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditingPrice}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingPrice(product.id)}
                          className="px-2 py-1 text-xs bg-azul-claro text-white rounded hover:bg-azul-profundo transition-colors"
                          title="Editar precios"
                        >
                          ✏️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-azul-claro/10 font-bold">
                <td className="p-2"></td>
                <td className="p-2">TOTAL SELECCIONADO</td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2 text-right">
                  ${selectedTotals.totalPurchase.toFixed(2)}
                </td>
                <td className="p-2 text-right">
                  {selectedTotals.totalConsignment > 0
                    ? `$${selectedTotals.totalConsignment.toFixed(2)}`
                    : '-'
                  }
                </td>
                <td className="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 space-y-1">
            {selectedProducts.size === 0 && (
              <span className="text-rosa font-medium">⚠️ Debe seleccionar al menos un producto para continuar</span>
            )}
            {selectedProducts.size > 0 && selectedProducts.size < summary.totalProducts && (
              <span className="text-amarillo font-medium block">
                ⚠️ {summary.totalProducts - selectedProducts.size} producto(s) no se incluirán en la valuación final
              </span>
            )}
            {selectedProducts.size === summary.totalProducts && selectedProducts.size > 0 && (
              <span className="text-verde-oscuro font-medium block">✓ Todos los productos están seleccionados</span>
            )}
            {Object.keys(editedPrices).length > 0 && (
              <span className="text-azul-profundo font-medium block">
                ✏️ {Object.keys(editedPrices).length} producto(s) con precios personalizados
              </span>
            )}
            {Object.keys(editedModalities).length > 0 && (
              <span className="text-azul-profundo font-medium block">
                🔄 {Object.keys(editedModalities).length} producto(s) con modalidad modificada
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-background border border-border rounded-md hover:bg-background-alt transition-colors"
              onClick={() => setShowSummary(false)}
            >
              Volver a Editar
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                selectedProducts.size === 0 || !client.name || !client.phone
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-azul-claro text-white hover:bg-azul-profundo'
              }`}
              onClick={printOffer}
              disabled={selectedProducts.size === 0 || !client.name || !client.phone}
              title={selectedProducts.size === 0 ? 'Seleccione al menos un producto' : !client.name || !client.phone ? 'Complete los datos básicos del cliente' : 'Imprimir oferta de compra'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
              Imprimir Oferta
            </button>

            {/* Botón para imprimir contrato de consignación */}
            {summary.productDetails.some(p => 
              selectedProducts.has(p.id) && 
              (editedModalities[p.id] === 'consignación' || (!editedModalities[p.id] && p.modality === 'consignación'))
            ) && (
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors"
                onClick={printConsignmentContract}
                disabled={!client.name || !client.phone}
                title={!client.name || !client.phone ? 'Complete los datos del cliente' : 'Imprimir contrato de consignación'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contrato Consignación
              </button>
            )}

            <button
              type="button"
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedProducts.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-verde-lima text-white hover:bg-verde-oscuro'
              }`}
              onClick={finalizeValuation}
              disabled={isFinalizingValuation || selectedProducts.size === 0}
            >
              {isFinalizingValuation ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 814 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finalizando...
                </span>
              ) : `Finalizar Valuación (${selectedProducts.size} productos)`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de carga durante verificación de autenticación
  if (authLoading) {
    console.log('🔄 Nueva Valuación: Mostrando pantalla de carga. Valores:', { authLoading, isAuthenticated, user: user?.username });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-claro mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Verificando autenticación...</h2>
          <p className="text-gray-500">Por favor espere</p>
          <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            <p>AuthLoading: {authLoading.toString()}</p>
            <p>IsAuthenticated: {isAuthenticated.toString()}</p>
            <p>User: {user?.username || 'null'}</p>
            <p>Timestamp: {new Date().toLocaleTimeString()}</p>
          </div>
          
          <button 
            onClick={() => {
              console.log('🔄 Forzando recarga manual de la página...');
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Si queda cargando, haz clic aquí
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de acceso restringido si no está autenticado
  if (!isAuthenticated) {
    let diagnosticInfo = '';
    if (typeof window !== 'undefined') {
      const rawToken = localStorage.getItem('entrepeques_auth_token');
      const rawUser = localStorage.getItem('entrepeques_user');
      diagnosticInfo = `
Token en localStorage: ${rawToken ? 'Presente' : 'Ausente'}
Usuario en localStorage: ${rawUser ? 'Presente' : 'Ausente'}
AuthContext isAuthenticated: ${isAuthenticated}
AuthContext user: ${user?.username || 'null'}
AuthContext loading: ${authLoading}
      `.trim();
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">Debe iniciar sesión para crear nuevas valuaciones.</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left text-xs">
            <h3 className="font-bold mb-2">Información de Diagnóstico:</h3>
            <pre className="whitespace-pre-wrap">{diagnosticInfo}</pre>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
            >
              Ir a iniciar sesión
            </a>
            
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  console.log('🔄 Forzando recarga completa...');
                  window.location.reload();
                }
              }}
              className="block w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔍 Estado de renderizado:', {
    showSummary,
    showClothingBulkForm,
    selectedClothingCategory: selectedClothingCategory?.id,
    productsCount: products.length,
    isAuthenticated,
    authLoading,
    user: user?.username,
    error
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-azul-profundo">Nueva Valuación</h1>
        <div className="flex items-center gap-3">
          <span className="bg-azul-claro text-white text-sm py-1 px-3 rounded-full">Fecha: {currentDate}</span>
          {valuation && (
            <span className="bg-amarillo text-white text-sm py-1 px-3 rounded-full">ID: VP-{valuation.id}</span>
          )}
        </div>
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`p-4 rounded-md ${
          notification.type === 'error' ? 'bg-rosa/10 border border-rosa text-rosa' :
          notification.type === 'warning' ? 'bg-amarillo/10 border border-amarillo text-amarillo' :
          'bg-verde-lima/10 border border-verde-lima text-verde-oscuro'
        } transition-all duration-300 ease-in-out`}>
          {notification.message}
        </div>
      )}

      {error && (
        <div className="bg-rosa/10 border border-rosa p-4 rounded-md text-rosa">
          {error}
        </div>
      )}

      {!showSummary ? (
        <>
          {/* Sección de Cliente */}
          <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-heading font-bold text-azul-claro mb-4">Datos del Cliente</h2>
            <ClienteForm 
              initialData={client}
              onChange={handleClientChange} 
            />
          </div>

          {/* Sección de Productos */}
          {products.map((product, index) => (
            product.isClothingBulk ? (
              <ClothingBulkProductDisplay
                key={product.id}
                product={product}
                index={index}
                onRemove={() => removeProduct(product.id)}
              />
            ) : (
              <ProductoForm
                key={product.id}
                id={`producto-${product.id}`}
                index={index}
                initialData={product.data}
                onRemove={() => removeProduct(product.id)}
                onChange={(data) => updateProductData(product.id, data)}
              />
            )
          ))}

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className="px-5 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-claro/80 transition-colors"
                onClick={addProduct}
              >
                + Agregar Producto
              </button>
              
              <button
                type="button"
                className="px-5 py-2 bg-rosa text-white rounded-md hover:bg-rosa/80 transition-colors"
                onClick={() => setShowClothingBulkForm(true)}
              >
                + Agregar Ropa (Masivo)
              </button>
            </div>

            <button
              type="button"
              className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
              onClick={generateSummary}
              disabled={isAddingItems}
            >
              {isAddingItems ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 814 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Generar Resumen'
              )}
            </button>
          </div>
        </>
      ) : (
        renderSummary()
      )}

      {/* Modal para selección de categoría de ropa */}
      {showClothingBulkForm && !selectedClothingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Seleccione la categoría de ropa</h3>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-2">Seleccione el tipo de prenda a valorar:</div>
                  {[
                    { id: 36, name: 'Niña - Cuerpo completo', categoryId: 5, categoryGroup: 'cuerpo_completo' },
                    { id: 37, name: 'Niña - Arriba de cintura', categoryId: 5, categoryGroup: 'arriba_cintura' },
                    { id: 38, name: 'Niña - Abajo de cintura', categoryId: 5, categoryGroup: 'abajo_cintura' },
                    { id: 39, name: 'Niño - Cuerpo completo', categoryId: 5, categoryGroup: 'cuerpo_completo' },
                    { id: 40, name: 'Niño - Arriba de cintura', categoryId: 5, categoryGroup: 'arriba_cintura' },
                    { id: 41, name: 'Niño - Abajo de cintura', categoryId: 5, categoryGroup: 'abajo_cintura' },
                    { id: 42, name: 'Calzado Niña', categoryId: 5, categoryGroup: 'calzado' },
                    { id: 43, name: 'Calzado Niño', categoryId: 5, categoryGroup: 'calzado' },
                    { id: 45, name: 'Ropa de Dama y Maternidad', categoryId: 5, categoryGroup: 'dama_maternidad' }
                  ].map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedClothingCategory(category)}
                      className="w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowClothingBulkForm(false)}
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para formulario masivo de ropa */}
      {showClothingBulkForm && selectedClothingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <ClothingBulkForm
              subcategoryId={selectedClothingCategory.id}
              categoryGroup={selectedClothingCategory.categoryGroup}
              onAddProducts={handleBulkClothingProducts}
              onCancel={() => {
                setShowClothingBulkForm(false);
                setSelectedClothingCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal del documento de oferta */}
      {showOfferDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-azul-profundo">Oferta de Compra - Entrepeques</h2>
                <button
                  onClick={() => setShowOfferDocument(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  data-modal-close
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <OfertaDocument
                  client={client}
                  selectedProducts={summary.productDetails.filter(product => 
                    selectedProducts.has(product.id) && 
                    (getFinalModality(product) === 'compra directa' || getFinalModality(product) === 'crédito en tienda')
                  )}
                  editedPrices={editedPrices}
                  editedModalities={editedModalities}
                  getProductDescription={getProductDescription}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del contrato de consignación */}
      {showConsignmentContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-azul-profundo">Contrato de Consignación - Entrepeques</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Agregar clase especial para impresión
                      document.body.classList.add('printing-contract');
                      
                      // Pequeño delay para asegurar que los estilos se apliquen
                      setTimeout(() => {
                        window.print();
                        
                        // Remover la clase después de imprimir
                        setTimeout(() => {
                          document.body.classList.remove('printing-contract');
                        }, 100);
                      }, 100);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                    </svg>
                    Imprimir
                  </button>
                  <button
                    onClick={() => setShowConsignmentContract(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    data-modal-close
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <ContratoConsignacion
                  client={client}
                  consignmentProducts={summary.productDetails.filter(product => 
                    selectedProducts.has(product.id) && 
                    getFinalModality(product) === 'consignación'
                  )}
                  valuationDate={new Date()}
                  getProductDescription={getProductDescription}
                  editedPrices={editedPrices}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NuevaValuacion() {
  // Verificar si ya estamos dentro de un AuthProvider
  const existingAuth = useContext(AuthContext);
  
  if (existingAuth !== undefined) {
    // Ya estamos dentro de un AuthProvider, no crear otro
    return <NuevaValuacionContent />;
  }
  
  // No hay AuthProvider, crear uno
  return (
    <AuthProvider>
      <NuevaValuacionContent />
    </AuthProvider>
  );
}