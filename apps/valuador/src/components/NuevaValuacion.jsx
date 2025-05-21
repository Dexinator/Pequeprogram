import React, { useState, useEffect } from 'react';
import { ProductoForm } from './ProductoForm';
import { ClienteForm } from './ClienteForm';
import { ValuationService } from '../services';
import { useAuth } from '../context/AuthContext';

// En un proyecto Astro puedes importar el layout directamente o usar un componente Layout React
// Para este ejemplo, asumimos que estamos usando la integración de React en Astro

export default function NuevaValuacion() {
  // Obtener contexto de autenticación
  const { isAuthenticated, user } = useAuth();

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
    console.log('Estado de autenticación en NuevaValuacion:', { isAuthenticated, user });

    if (!isAuthenticated) {
      console.warn('Usuario no autenticado en NuevaValuacion');
      setError('Debe iniciar sesión para utilizar esta funcionalidad');
      showNotification('Debe iniciar sesión para utilizar esta funcionalidad', 'error');

      // Verificar si hay un token en localStorage directamente
      if (typeof window !== 'undefined' && localStorage.getItem('entrepeques_auth_token')) {
        console.log('Se encontró un token en localStorage pero isAuthenticated es false');
        console.log('Intentando actualizar el token en el servicio de valuación de todos modos');
        valuationService.refreshAuthToken();
      }
    } else {
      console.log('Usuario autenticado en NuevaValuacion:', user?.username);
      // Actualizar el token en el servicio de valuación
      valuationService.refreshAuthToken();

      // Limpiar cualquier error de autenticación previo
      if (error && error.includes('iniciar sesión')) {
        setError(null);
      }
    }
  }, [isAuthenticated, user]);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });

    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
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
      // Crear valuación si no existe
      let valuationId = valuation?.id;

      if (!valuationId) {
        console.log('No hay valuación existente, creando una nueva');
        const newValuation = await createValuation();
        if (!newValuation) {
          setIsAddingItems(false);
          return;
        }
        valuationId = newValuation.id;
        console.log('Nueva valuación creada con ID:', valuationId);
      } else {
        console.log('Usando valuación existente con ID:', valuationId);
      }

      // Agregar productos a la valuación
      const productResults = [];
      let errorCount = 0;

      console.log(`Agregando ${validProducts.length} productos a la valuación`);

      for (const product of validProducts) {
        try {
          const itemData = {
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
            features: product.data.features || {},
            notes: product.data.notes || '',
            images: product.data.images || []
          };

          console.log('Enviando datos de producto:', itemData);

          const result = await valuationService.addValuationItem(valuationId, itemData);
          console.log('Producto agregado con éxito:', result);

          productResults.push({
            ...result,
            categoryName: product.data.categoryName,
            subcategoryName: product.data.subcategoryName,
            brandName: product.data.brandName
          });
        } catch (error) {
          console.error('Error al agregar producto:', error);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        showNotification(`${errorCount} productos no pudieron ser agregados`, 'warning');
      }

      // Actualizar valuación después de agregar productos
      console.log('Obteniendo valuación actualizada');
      const updatedValuation = await valuationService.getValuation(valuationId);
      console.log('Valuación actualizada:', updatedValuation);
      setValuation(updatedValuation);

      // Preparar resumen
      // Ensure all values are numbers with default value of 0
      const totalPurchase = productResults.reduce((sum, item) => {
        const price = item.suggested_purchase_price ? Number(item.suggested_purchase_price) : 0;
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      const totalSale = productResults.reduce((sum, item) => {
        const price = item.suggested_sale_price ? Number(item.suggested_sale_price) : 0;
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      const totalConsignment = productResults.reduce((sum, item) => {
        if (item.modality !== 'consignación') return sum;
        const price = item.consignment_price ? Number(item.consignment_price) : 0;
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      console.log('Calculated totals:', {
        totalPurchase,
        totalSale,
        totalConsignment,
        isNumber: {
          totalPurchase: typeof totalPurchase === 'number',
          totalSale: typeof totalSale === 'number',
          totalConsignment: typeof totalConsignment === 'number'
        }
      });

      setSummary({
        totalProducts: productResults.length,
        totalPurchaseValue: Number(totalPurchase) || 0,
        totalSaleValue: Number(totalSale) || 0,
        totalConsignmentValue: Number(totalConsignment) || 0,
        productDetails: productResults
      });

      setShowSummary(true);
      showNotification(`Resumen generado con ${productResults.length} productos`);
    } catch (error) {
      console.error('Error al generar resumen:', error);
      setError('Error al generar el resumen. Por favor intente nuevamente.');
      showNotification('Error al generar el resumen', 'error');
    } finally {
      setIsAddingItems(false);
    }
  };

  // Finalizar valuación
  const finalizeValuation = async (e) => {
    e.preventDefault();

    if (!valuation) {
      setError('No hay una valuación en curso para finalizar');
      showNotification('No hay una valuación en curso para finalizar', 'error');
      return;
    }

    setIsFinalizingValuation(true);
    setError(null);

    try {
      console.log('Finalizando valuación con ID:', valuation.id);

      const finalizationData = {
        status: 'completed',
        notes: '',
        items: valuation.items?.map(item => ({
          id: item.id,
          final_purchase_price: item.suggested_purchase_price,
          final_sale_price: item.suggested_sale_price
        }))
      };

      console.log('Datos de finalización:', finalizationData);

      const finalizedValuation = await valuationService.finalizeValuation(valuation.id, finalizationData);

      console.log('Valuación finalizada con éxito:', finalizedValuation);
      showNotification('Valuación finalizada con éxito');

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

    return (
      <div className="bg-background-alt p-6 rounded-lg shadow-md border border-border mt-8">
        <h2 className="text-2xl font-heading font-bold text-azul-profundo mb-4">Resumen de Valuación</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-background rounded-md">
          <div className="text-center p-3 border border-border rounded-md bg-azul-claro/5">
            <p className="text-sm text-gray-600">Total de Productos</p>
            <p className="text-2xl font-bold text-azul-profundo">{summary.totalProducts}</p>
          </div>

          <div className="text-center p-3 border border-border rounded-md bg-verde-lima/5">
            <p className="text-sm text-gray-600">Valor Total de Compra</p>
            <p className="text-2xl font-bold text-verde-oscuro">
              ${typeof summary.totalPurchaseValue === 'number' ? summary.totalPurchaseValue.toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="text-center p-3 border border-border rounded-md bg-amarillo/5">
            <p className="text-sm text-gray-600">Valor Total de Venta</p>
            <p className="text-2xl font-bold text-azul-profundo">
              ${typeof summary.totalSaleValue === 'number' ? summary.totalSaleValue.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background-alt border-b border-border">
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-right">Precio Compra</th>
                <th className="p-2 text-right">Precio Venta</th>
                <th className="p-2 text-right">Consignación</th>
              </tr>
            </thead>
            <tbody>
              {summary.productDetails.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-background' : 'bg-background-alt'}>
                  <td className="p-2 border-b border-border">
                    <div className="font-medium">{product.subcategoryName || `Producto #${index + 1}`}</div>
                    <div className="text-sm text-gray-600">
                      {product.status} • {product.condition_state} • {product.demand}
                    </div>
                  </td>
                  <td className="p-2 text-right border-b border-border font-medium">
                    ${typeof product.suggested_purchase_price === 'number'
                      ? product.suggested_purchase_price.toFixed(2)
                      : '0.00'}
                  </td>
                  <td className="p-2 text-right border-b border-border font-medium">
                    ${typeof product.suggested_sale_price === 'number'
                      ? product.suggested_sale_price.toFixed(2)
                      : '0.00'}
                  </td>
                  <td className="p-2 text-right border-b border-border font-medium">
                    {typeof product.consignment_price === 'number' && product.consignment_price > 0
                      ? `$${product.consignment_price.toFixed(2)}`
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-azul-claro/10 font-bold">
                <td className="p-2">TOTAL</td>
                <td className="p-2 text-right">
                  ${typeof summary.totalPurchaseValue === 'number' ? summary.totalPurchaseValue.toFixed(2) : '0.00'}
                </td>
                <td className="p-2 text-right">
                  ${typeof summary.totalSaleValue === 'number' ? summary.totalSaleValue.toFixed(2) : '0.00'}
                </td>
                <td className="p-2 text-right">
                  {typeof summary.totalConsignmentValue === 'number' && summary.totalConsignmentValue > 0
                    ? `$${summary.totalConsignmentValue.toFixed(2)}`
                    : '-'
                  }
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-background border border-border rounded-md hover:bg-background-alt transition-colors"
            onClick={() => setShowSummary(false)}
          >
            Volver a Editar
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
            onClick={finalizeValuation}
            disabled={isFinalizingValuation}
          >
            {isFinalizingValuation ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finalizando...
              </span>
            ) : 'Finalizar Valuación'}
          </button>
        </div>
      </div>
    );
  };

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
            <ClienteForm onChange={handleClientChange} />
          </div>

          {/* Sección de Productos */}
          {products.map((product, index) => (
            <ProductoForm
              key={product.id}
              id={`producto-${product.id}`}
              index={index}
              onRemove={() => removeProduct(product.id)}
              onChange={(data) => updateProductData(product.id, data)}
            />
          ))}

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-4 justify-between">
            <button
              type="button"
              className="px-5 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-claro/80 transition-colors"
              onClick={addProduct}
            >
              + Agregar Producto
            </button>

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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    </div>
  );
}