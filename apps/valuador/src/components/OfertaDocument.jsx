import React from 'react';

const OfertaDocument = ({ client, selectedProducts, editedPrices, editedModalities, getProductDescription }) => {
  // Calcular totales de productos seleccionados (incluir cantidad)
  const calculateOfferTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const editedPrice = editedPrices[product.id];
      const price = editedPrice?.purchase !== undefined 
        ? Number(editedPrice.purchase)
        : (product.suggested_purchase_price ? Number(product.suggested_purchase_price) : 0);
      const quantity = Number(product.quantity) || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getFinalPurchasePrice = (product) => {
    const editedPrice = editedPrices[product.id];
    const finalModality = editedModalities[product.id] || product.modality;
    
    // Si hay precio editado manualmente, usarlo
    if (editedPrice?.purchase !== undefined) {
      const numericPrice = Number(editedPrice.purchase);
      return isNaN(numericPrice) ? 0 : numericPrice;
    }
    
    // Si no hay precio editado, calcular según modalidad
    const basePrice = product.suggested_purchase_price || 0;
    let finalPrice = basePrice;
    
    if (finalModality === 'crédito en tienda') {
      finalPrice = basePrice * 1.1; // 10% más que compra directa
    } else if (finalModality === 'consignación') {
      finalPrice = basePrice * 1.2; // 20% más que compra directa
    }
    // Para 'compra directa' usar precio base
    
    const numericPrice = Number(finalPrice);
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  const getTotalPriceForProduct = (product) => {
    const unitPrice = getFinalPurchasePrice(product);
    const quantity = Number(product.quantity) || 1;
    return unitPrice * quantity;
  };

  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const offerTotal = calculateOfferTotal();

  return (
    <div className="oferta-document bg-white text-gray-800 max-w-4xl mx-auto p-8 font-sans print:p-5 print:max-w-none print:mx-0">
      <style jsx>{`
        /* Estilos solo para la vista del modal */
        .oferta-document {
          line-height: 1.4;
        }
        
        .print-table {
          border-collapse: collapse;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #e5e7eb;
        }
      `}</style>

      {/* Encabezado de la empresa */}
      <div className="print-header mb-8">
        <div className="flex justify-between items-start">
          <div className="company-info">
            <h1 className="text-2xl font-bold text-azul-claro mb-1" style={{ color: '#00A0DD' }}>
              Entrepeques
            </h1>
            <p className="text-xs text-gray-600 mb-1">Compra y venta de artículos infantiles</p>
            <p className="text-xs text-gray-600 mb-1">📍 Av. Homero 1616, Polanco, Miguel Hidalgo, CDMX 11510</p>
            <p className="text-xs text-gray-600 mb-1">📞 55 6588 3245</p>
            <p className="text-xs text-gray-600">✉️ contacto@entrepeques.mx</p>
          </div>
          
          <div className="document-info text-right">
            <h2 className="text-lg font-bold text-azul-profundo mb-1" style={{ color: '#0070B9' }}>
              OFERTA DE COMPRA
            </h2>
            <p className="text-xs text-gray-600 mb-1">Fecha: {currentDate}</p>
            <p className="text-xs text-gray-600">Válida por: 7 días</p>
          </div>
        </div>
      </div>

      {/* Información del proveedor */}
      <div className="provider-info mb-4 p-3 bg-gray-50 rounded">
        <h3 className="text-sm font-bold text-azul-profundo mb-2" style={{ color: '#0070B9' }}>
          Datos del Proveedor
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Nombre:</span>
            <p className="font-medium">{client.name || 'No especificado'}</p>
          </div>
          <div>
            <span className="text-gray-600">Teléfono:</span>
            <p className="font-medium">{client.phone || 'No especificado'}</p>
          </div>
          {client.email && (
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{client.email}</p>
            </div>
          )}
          {client.identification && (
            <div>
              <span className="text-gray-600">ID:</span>
              <p className="font-medium">{client.identification}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="products-section mb-6">
        <h3 className="text-sm font-bold text-azul-profundo mb-2" style={{ color: '#0070B9' }}>
          Productos Incluidos en la Oferta
        </h3>
        <p className="text-xs text-gray-600 mb-2">
          * Productos "Crédito en tienda" se pagan con vales canjeables únicamente en nuestra tienda
        </p>
        
        <table className="print-table w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-azul-claro text-white" style={{ backgroundColor: '#00A0DD', color: 'white' }}>
              <th className="border border-gray-300 px-2 py-2 text-left font-medium text-xs">
                #
              </th>
              <th className="border border-gray-300 px-2 py-2 text-left font-medium text-xs">
                Descripción del Producto
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs">
                Modalidad
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-xs">
                Cantidad
              </th>
              <th className="border border-gray-300 px-2 py-2 text-right font-medium text-xs">
                Precio Unitario
              </th>
              <th className="border border-gray-300 px-2 py-2 text-right font-medium text-xs">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((product, index) => {
              const finalPrice = getFinalPurchasePrice(product);
              const quantity = Number(product.quantity) || 1;
              const totalPrice = getTotalPriceForProduct(product);
              const finalModality = editedModalities[product.id] || product.modality;
              
              // Determinar el estilo y texto de la modalidad
              const getModalityDisplay = (modality) => {
                switch(modality) {
                  case 'compra directa':
                    return { text: 'Efectivo', style: 'text-green-700 bg-green-100' };
                  case 'crédito en tienda':
                    return { text: 'Crédito Tienda', style: 'text-blue-700 bg-blue-100' };
                  case 'consignación':
                    return { text: 'Consignación', style: 'text-orange-700 bg-orange-100' };
                  default:
                    return { text: modality, style: 'text-gray-700 bg-gray-100' };
                }
              };
              
              const modalityDisplay = getModalityDisplay(finalModality);
              
              return (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-2 text-center text-xs font-medium">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-xs">
                     <div className="product-description">
                       <p className="font-medium">
                         {getProductDescription(product, index)}
                       </p>
                     </div>
                   </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${modalityDisplay.style}`}>
                      {modalityDisplay.text}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center text-xs font-medium">
                    {quantity}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-xs font-medium">
                    {formatCurrency(finalPrice)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-xs font-bold">
                    {formatCurrency(totalPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="print-total-row bg-azul-claro text-white" style={{ backgroundColor: '#00A0DD', color: 'white' }}>
              <td className="border border-gray-300 px-2 py-2 font-bold text-center text-xs" colSpan="5">
                TOTAL DE LA OFERTA
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right font-bold text-sm">
                {formatCurrency(offerTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Términos y condiciones */}
      <div className="terms-section mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-azul-profundo mb-3" style={{ color: '#0070B9' }}>
          Términos y Condiciones
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• Esta oferta es válida por <strong>7 días</strong> a partir de la fecha de emisión.</p>
          <p>• Los precios están sujetos a la verificación física final del estado de los productos.</p>
          <p>• Los productos deben estar en las condiciones descritas en el momento de la entrega.</p>
          <p>• <strong>Modalidades de pago:</strong></p>
          <div className="ml-4 space-y-1">
            <p>◦ <strong>Efectivo:</strong> Pago inmediato en dinero en efectivo</p>
            <p>◦ <strong>Crédito en tienda:</strong> Pago mediante vales/créditos canjeables únicamente en productos de nuestra tienda (no reembolsables en efectivo)</p>
          </div>
          <p>• Entrepeques se reserva el derecho de ajustar los precios si el estado real del producto difiere significativamente de lo descrito.</p>
          <p>• Para hacer efectiva esta oferta, favor de contactar al teléfono indicado en el encabezado.</p>
        </div>
      </div>

      {/* Pie de página */}
      <div className="footer-section border-t border-gray-300 pt-4">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Entrepeques</strong> - Facilitando el consumo responsable de productos infantiles
          </p>
          <p className="italic">
            "Dando nueva vida a los productos para nuestros pequeños"
          </p>
        </div>
      </div>

      {/* Botones de acción (no se imprimen) */}
      <div className="no-print mt-8 flex justify-center gap-4">
        <button
          onClick={() => {
            // Crear una nueva ventana solo con el contenido del documento
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            if (printWindow) {
              // Obtener el HTML del documento actual
              const documentContent = document.querySelector('.oferta-document').outerHTML;
              
              printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Oferta de Compra - Entrepeques</title>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    @media print {
                      * {
                        box-shadow: none !important;
                        outline: none !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                      }
                      
                      html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                      }
                      
                      .oferta-document {
                        margin: 0 !important;
                        padding: 15mm !important;
                        box-shadow: none !important;
                        background: white !important;
                        color: black !important;
                        font-size: 11px;
                        border: none !important;
                        width: 100% !important;
                        max-width: none !important;
                      }
                      
                      .no-print {
                        display: none !important;
                      }
                      
                      .print-header {
                        border-bottom: 1px solid #666;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                      }
                      
                      .provider-info, .terms-section, .footer-section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        margin-bottom: 15px;
                        border: none !important;
                        background: white !important;
                      }
                      
                      .products-section {
                        break-inside: auto;
                      }
                      
                      .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        break-inside: auto;
                        border: 1px solid #666 !important;
                        font-size: 10px;
                      }
                      
                      .print-table th,
                      .print-table td {
                        border: 1px solid #666 !important;
                        padding: 3px 4px;
                        text-align: left;
                        vertical-align: top;
                        background: white !important;
                        page-break-inside: auto;
                      }
                      
                      .print-table th {
                        background-color: #f5f5f5 !important;
                        font-weight: bold;
                        font-size: 9px;
                        page-break-after: avoid;
                      }
                      
                      .print-table tbody tr {
                        page-break-inside: auto;
                        break-inside: auto;
                      }
                      
                      .print-total-row td {
                        background-color: #f0f0f0 !important;
                        font-weight: bold;
                        page-break-before: avoid;
                      }
                      
                      .print-table thead {
                        display: table-header-group;
                      }
                      
                      .print-table tfoot {
                        display: table-footer-group;
                      }
                      
                      /* Evitar huérfanas al final de página */
                      .print-table tbody {
                        orphans: 3;
                        widows: 3;
                      }
                    }
                    
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      margin: 0;
                      padding: 20px;
                      background: white;
                    }
                    
                    .no-print {
                      text-align: center;
                      margin: 20px 0;
                    }
                    
                    .no-print button {
                      background: #00A0DD;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      cursor: pointer;
                      margin: 0 10px;
                    }
                    
                    .no-print button:hover {
                      background: #0070B9;
                    }
                  </style>
                </head>
                <body>
                  ${documentContent}
                  <script>
                    // Auto-abrir diálogo de impresión después de que la página cargue
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                      }, 500);
                    };
                    
                    // Cerrar ventana después de imprimir o cancelar
                    window.onafterprint = function() {
                      window.close();
                    };
                  </script>
                </body>
                </html>
              `);
              
              printWindow.document.close();
            } else {
              alert('No se pudo abrir la ventana de impresión. Por favor, permita ventanas emergentes para esta página.');
            }
          }}
          className="px-6 py-3 bg-azul-claro text-white rounded-lg hover:bg-azul-profundo transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
          Imprimir Documento
        </button>
        
        <button
          onClick={() => {
            // Si estamos en una ventana separada, cerrarla
            if (window.opener) {
              window.close();
            } else {
              // Si estamos en un modal, buscar el botón de cerrar del modal
              const closeButton = document.querySelector('[data-modal-close]');
              if (closeButton) {
                closeButton.click();
              }
            }
          }}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default OfertaDocument; 