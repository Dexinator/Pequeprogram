import React, { useState, useEffect } from 'react';
import { ProductoForm } from './ProductoForm';
import { ClienteForm } from './ClienteForm';
import { ValuationService } from '../services';

// En un proyecto Astro puedes importar el layout directamente o usar un componente Layout React
// Para este ejemplo, asumimos que estamos usando la integración de React en Astro

export default function NuevaValuacion() {
  // Estado para la valuación
  const [valuation, setValuation] = useState(null);
  const [isCreatingValuation, setIsCreatingValuation] = useState(false);
  const [isFinalizingValuation, setIsFinalizingValuation] = useState(false);
  
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
  
  // Fecha actual formateada
  const currentDate = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  
  // Instanciar servicio de valuación
  const valuationService = new ValuationService();
  
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
      } else {
        // Nuevo cliente, crear
        clientResponse = await valuationService.createClient({
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          identification: client.identification || ''
        });
      }
      
      // 2. Crear valuación
      const valuationResponse = await valuationService.createValuation({
        client_id: clientResponse.id,
        notes: ''
      });
      
      setValuation(valuationResponse);
      return valuationResponse;
    } catch (error) {
      console.error('Error al crear valuación:', error);
      setError('Error al crear la valuación. Por favor intente nuevamente.');
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
    
    try {
      // Crear valuación si no existe
      let valuationId = valuation?.id;
      
      if (!valuationId) {
        const newValuation = await createValuation();
        if (!newValuation) return;
        valuationId = newValuation.id;
      }
      
      // Agregar productos a la valuación
      const productResults = [];
      
      for (const product of validProducts) {
        try {
          const itemData = {
            category_id: Number(product.data.category_id),
            subcategory_id: Number(product.data.subcategory_id),
            brand_id: product.data.brand_id ? Number(product.data.brand_id) : null,
            status: product.data.status,
            brand_renown: product.data.brand_renown,
            modality: product.data.modality,
            condition_state: product.data.condition_state,
            demand: product.data.demand || 'media',
            cleanliness: product.data.cleanliness || 'buena',
            new_price: Number(product.data.new_price),
            features: product.data.features || {},
            notes: product.data.notes || ''
          };
          
          const result = await valuationService.addValuationItem(valuationId, itemData);
          productResults.push(result);
        } catch (error) {
          console.error('Error al agregar producto:', error);
        }
      }
      
      // Actualizar valuación después de agregar productos
      const updatedValuation = await valuationService.getValuation(valuationId);
      setValuation(updatedValuation);
      
      // Preparar resumen
      const totalPurchase = productResults.reduce((sum, item) => sum + (item.suggested_purchase_price || 0), 0);
      const totalSale = productResults.reduce((sum, item) => sum + (item.suggested_sale_price || 0), 0);
      const totalConsignment = productResults.reduce((sum, item) => 
        sum + (item.modality === 'consignación' ? (item.consignment_price || 0) : 0), 0);
      
      setSummary({
        totalProducts: productResults.length,
        totalPurchaseValue: totalPurchase,
        totalSaleValue: totalSale,
        totalConsignmentValue: totalConsignment,
        productDetails: productResults
      });
      
      setShowSummary(true);
    } catch (error) {
      console.error('Error al generar resumen:', error);
      setError('Error al generar el resumen. Por favor intente nuevamente.');
    }
  };
  
  // Finalizar valuación
  const finalizeValuation = async (e) => {
    e.preventDefault();
    
    if (!valuation) {
      setError('No hay una valuación en curso para finalizar');
      return;
    }
    
    setIsFinalizingValuation(true);
    setError(null);
    
    try {
      const result = await valuationService.finalizeValuation(valuation.id, {
        status: 'completed',
        notes: '',
        items: valuation.items?.map(item => ({
          id: item.id,
          final_purchase_price: item.suggested_purchase_price,
          final_sale_price: item.suggested_sale_price
        }))
      });
      
      alert('Valuación finalizada con éxito.');
      
      // Redirigir al historial
      setTimeout(() => {
        window.location.href = '/historial';
      }, 1000);
    } catch (error) {
      console.error('Error al finalizar valuación:', error);
      setError('Error al finalizar la valuación. Por favor intente nuevamente.');
    } finally {
      setIsFinalizingValuation(false);
    }
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
      
      <p className="text-text-muted">
        Complete los datos del cliente y los artículos para obtener una valuación precisa. Los campos marcados con 
        <span className="text-rosa">*</span> son obligatorios.
      </p>

      {error && (
        <div className="bg-rosa/10 border border-rosa rounded-md p-3 text-rosa">
          {error}
        </div>
      )}

      <form id="valuacion-form" className="mt-6 space-y-8" onSubmit={finalizeValuation}>
        {/* Sección de Cliente */}
        <ClienteForm 
          id="cliente-principal" 
          className="mb-8" 
          initialData={client}
          onChange={handleClientChange}
        />
        
        {/* Sección de Productos */}
        <div className="mb-4">
          <h2 className="text-2xl font-heading font-bold text-azul-profundo mb-2">Productos</h2>
          <p className="text-text-muted">Agregue todos los productos que desea valuar.</p>
        </div>
        
        {/* Contenedor de productos */}
        <div id="productos-container">
          {products.map((product, index) => (
            <ProductoForm 
              key={product.id}
              id="producto"
              index={index}
              onRemove={() => removeProduct(product.id)}
              onChange={(data) => updateProductData(product.id, data)}
            />
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={addProduct}
            className="px-5 py-2 border border-azul-claro text-azul-claro bg-azul-claro/10 rounded-md hover:bg-azul-claro/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar otro producto
            </span>
          </button>
        </div>
        
        {/* Resumen de la valuación */}
        {showSummary && valuation && (
          <div id="resumen-container" className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-heading font-bold text-verde-oscuro mb-4">Resumen de Valuación</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Datos del Cliente</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Nombre:</span> {client.name}</p>
                  <p><span className="font-medium">Teléfono:</span> {client.phone}</p>
                  {client.email && <p><span className="font-medium">Email:</span> {client.email}</p>}
                  {client.identification && <p><span className="font-medium">Identificación:</span> {client.identification}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Totales</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Total productos:</span>
                    <span className="font-bold">{summary.totalProducts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor total de compra:</span>
                    <span className="font-bold text-azul-profundo">${summary.totalPurchaseValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor total de venta:</span>
                    <span className="font-bold text-verde-oscuro">${summary.totalSaleValue.toFixed(2)}</span>
                  </div>
                  {summary.totalConsignmentValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Valor total en consignación:</span>
                      <span className="font-bold text-amarillo">${summary.totalConsignmentValue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Detalle de Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">#</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Estado</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Modalidad</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-text-muted tracking-wider">Precio Compra</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-text-muted tracking-wider">Precio Venta</th>
                      {summary.totalConsignmentValue > 0 && (
                        <th className="px-3 py-2 text-right text-sm font-medium text-text-muted tracking-wider">Precio Consignación</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {valuation.items?.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 whitespace-nowrap">{index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.status}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.modality}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">${item.suggested_purchase_price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">${item.suggested_sale_price.toFixed(2)}</td>
                        {summary.totalConsignmentValue > 0 && (
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {item.modality === 'consignación' && item.consignment_price
                              ? `$${item.consignment_price.toFixed(2)}`
                              : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-between pt-4 border-t border-border">
          <button 
            type="button" 
            onClick={() => {
              if (confirm('¿Está seguro que desea cancelar esta valuación? Se perderán todos los datos.')) {
                window.location.href = '/';
              }
            }}
            className="px-5 py-2 border border-border bg-background rounded-md hover:bg-background-alt transition-colors"
          >
            Cancelar
          </button>
          
          <div className="space-x-3">
            <button 
              type="button" 
              onClick={generateSummary}
              className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
              disabled={isCreatingValuation}
            >
              {isCreatingValuation ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Generar Resumen'
              )}
            </button>
            
            {showSummary && (
              <button 
                type="submit"
                className="px-5 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
                disabled={isFinalizingValuation}
              >
                {isFinalizingValuation ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finalizando...
                  </span>
                ) : (
                  'Finalizar Valuación'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 