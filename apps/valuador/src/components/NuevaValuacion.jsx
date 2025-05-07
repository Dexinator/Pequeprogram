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
          
          const result = await valuationService.addValuationItem(valuationId, itemData);
          productResults.push({
            ...result,
            categoryName: product.data.categoryName,
            subcategoryName: product.data.subcategoryName,
            brandName: product.data.brandName
          });
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
            <p className="text-2xl font-bold text-verde-oscuro">${summary.totalPurchaseValue.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-3 border border-border rounded-md bg-amarillo/5">
            <p className="text-sm text-gray-600">Valor Total de Venta</p>
            <p className="text-2xl font-bold text-azul-profundo">${summary.totalSaleValue.toFixed(2)}</p>
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
                    ${product.suggested_purchase_price?.toFixed(2)}
                  </td>
                  <td className="p-2 text-right border-b border-border font-medium">
                    ${product.suggested_sale_price?.toFixed(2)}
                  </td>
                  <td className="p-2 text-right border-b border-border font-medium">
                    {product.consignment_price 
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
                <td className="p-2 text-right">${summary.totalPurchaseValue.toFixed(2)}</td>
                <td className="p-2 text-right">${summary.totalSaleValue.toFixed(2)}</td>
                <td className="p-2 text-right">
                  {summary.totalConsignmentValue > 0 
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
            {isFinalizingValuation ? 'Finalizando...' : 'Finalizar Valuación'}
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
            >
              Generar Resumen
            </button>
          </div>
        </>
      ) : (
        renderSummary()
      )}
    </div>
  );
} 