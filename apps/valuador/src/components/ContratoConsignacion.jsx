import React from 'react';

const ContratoConsignacion = ({ client, consignmentProducts, valuationDate, getProductDescription, editedPrices }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  };

  const calculateExpirationDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 90); // 90 días de vigencia
    return formatDate(d);
  };

  // Obtener el precio de venta final (considerando ediciones)
  const getFinalSalePrice = (product) => {
    // Si hay precio editado de venta, usarlo para el contrato
    if (editedPrices && editedPrices[product.id]?.sale !== undefined) {
      return parseFloat(editedPrices[product.id].sale) || 0;
    }
    // Si no hay precio editado, usar el precio de consignación calculado
    // El consignment_price ya incluye el 20% adicional sobre el precio de compra
    return parseFloat(product.consignment_price || product.suggested_sale_price || product.final_sale_price) || 0;
  };

  // Calcular descuentos progresivos (10% cada 8 semanas)
  const calculateDiscountSchedule = (product) => {
    const basePrice = getFinalSalePrice(product);
    return [
      { weeks: '0-8', price: basePrice, discount: '0%' },
      { weeks: '8-16', price: basePrice * 0.9, discount: '10%' },
      { weeks: '16-24', price: basePrice * 0.8, discount: '20%' }
    ];
  };

  // Obtener descripción completa del producto
  const getFullProductDescription = (product) => {
    const description = getProductDescription(product);
    const quantity = product.quantity > 1 ? ` (${product.quantity} unidades)` : '';
    return `${description}${quantity}`;
  };

  const currentDate = formatDate(valuationDate || new Date());

  return (
    <div id="contrato-consignacion" className="contrato-container">
      {/* Header con logo */}
      <div className="contrato-header">
        <div className="logo-section">
          <svg className="logo" width="120" height="40" viewBox="0 0 200 60">
            <circle cx="30" cy="30" r="25" fill="#ff6b9d"/>
            <circle cx="45" cy="30" r="25" fill="#feca57" opacity="0.7"/>
            <text x="75" y="35" fontFamily="Fredoka One, Arial" fontSize="24" fill="#2d3436">
              Entrepeques
            </text>
          </svg>
        </div>
        <div className="contract-title">
          <h2>CONTRATO DE CONSIGNACIÓN MERCANTIL</h2>
          <p className="contract-number">Folio: {new Date().getTime().toString().slice(-8)}</p>
        </div>
      </div>

      {/* Datos del consignante */}
      <div className="contrato-section">
        <h3>DATOS DEL CONSIGNANTE</h3>
        <div className="client-info">
          <div className="info-row">
            <span className="label">Nombre:</span>
            <span className="value">{client?.name || '_______________________________________'}</span>
          </div>
          <div className="info-row">
            <span className="label">Domicilio:</span>
            <span className="value">________________________________________________________________________</span>
          </div>
          <div className="info-row">
            <span className="label">Teléfono:</span>
            <span className="value">{client?.phone || '____________________'}</span>
            <span className="label" style={{marginLeft: '20px'}}>Email:</span>
            <span className="value">{client?.email || '____________________________'}</span>
          </div>
          <div className="info-row">
            <span className="label">Identificación:</span>
            <span className="value">{client?.identification || '_______________________________________________________________'}</span>
          </div>
        </div>
      </div>

      {/* Productos en consignación */}
      <div className="contrato-section">
        <h3>DESCRIPCIÓN DE BIENES EN CONSIGNACIÓN</h3>
        <table className="products-table">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Descripción</th>
              <th>Precio de Venta</th>
              <th>8 semanas<br/>(10% desc.)</th>
              <th>16 semanas<br/>(20% desc.)</th>
              <th>Pago al Cliente<br/>(50%)</th>
            </tr>
          </thead>
          <tbody>
            {consignmentProducts.map((product, index) => {
              const schedule = calculateDiscountSchedule(product);
              const clientPayment = schedule[0].price * 0.5; // 50% del precio de venta
              return (
                <tr key={index}>
                  <td className="center">{product.quantity || 1}</td>
                  <td>{getFullProductDescription(product)}</td>
                  <td className="price">{formatCurrency(schedule[0].price)}</td>
                  <td className="price">{formatCurrency(schedule[1].price)}</td>
                  <td className="price">{formatCurrency(schedule[2].price)}</td>
                  <td className="price" style={{backgroundColor: '#e8f5e9', fontWeight: 'bold'}}>
                    {formatCurrency(clientPayment)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="total-label">TOTALES:</td>
              <td className="total-price">
                {formatCurrency(consignmentProducts.reduce((sum, p) =>
                  sum + (getFinalSalePrice(p) * (p.quantity || 1)), 0))}
              </td>
              <td colSpan="2"></td>
              <td className="total-price" style={{backgroundColor: '#e8f5e9', fontWeight: 'bold'}}>
                {formatCurrency(consignmentProducts.reduce((sum, p) =>
                  sum + (getFinalSalePrice(p) * (p.quantity || 1) * 0.5), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Condiciones importantes */}
      <div className="contrato-section conditions">
        <h3>CONDICIONES IMPORTANTES</h3>
        <ul>
          <li><strong>Duración:</strong> Este contrato tiene vigencia de 90 días naturales a partir de la fecha de firma.</li>
          <li><strong>Fecha de vencimiento:</strong> {calculateExpirationDate(valuationDate || new Date())}</li>
          <li><strong>Comisión:</strong> Al venderse el producto, el consignante recibirá el 50% del precio de venta real.</li>
          <li><strong>Pago:</strong> El pago se realizará a más tardar el día 30 del mes siguiente a la venta del artículo.</li>
          <li><strong>Descuentos:</strong> El precio se reducirá 10% cada 8 semanas hasta la venta o retiro del producto.</li>
          <li><strong>Devolución:</strong> El consignante puede solicitar la devolución después de 60 días, pagando 10% del precio de venta por gastos de almacenaje.</li>
          <li><strong>Artículos no recogidos:</strong> Pasados 3 meses del vencimiento sin recoger, los artículos pasan a ser propiedad de Entrepeques.</li>
        </ul>
      </div>

      {/* Términos y condiciones completos */}
      <div className="contrato-section terms">
        <h3>TÉRMINOS Y CONDICIONES</h3>
        <div className="legal-text">
          <p><strong>DECLARACIONES</strong></p>
          
          <p><strong>A) Declara el CONSIGNANTE por su propio derecho que:</strong></p>
          <ol>
            <li>Es una persona física, con domicilio señalado en este contrato, tal como su identidad se acredita con credencial para votar con fotografía.</li>
            <li>Es su voluntad otorgar en consignación los productos descritos en este contrato.</li>
            <li>Es el legítimo propietario de los productos descritos y mantiene a salvo a Entrepeques de cualquier reclamo de propiedad hecho por terceros.</li>
          </ol>

          <p><strong>B) Declara Entrepeques:</strong></p>
          <ol>
            <li>Tener como su principal actividad la compra, venta y la celebración de contratos de consignación de bienes muebles usados.</li>
            <li>Que por así convenir a sus intereses, se encuentra interesado en obtener en consignación los productos descritos.</li>
          </ol>

          <p><strong>CLÁUSULAS</strong></p>
          
          <p><strong>PRIMERA. Consignación mercantil.</strong> El Consignante transmite al consignatario la posesión de los productos descritos, con el objeto de que sean promovidos para su venta en las tiendas del consignatario.</p>
          
          <p><strong>SEGUNDA. Precio.</strong> El precio de venta será el señalado en la tabla anterior, pudiendo reducirse en 10% cada 8 semanas. En caso de venta, el Consignante recibirá el 50% del precio de venta real.</p>
          
          <p><strong>TERCERA. Duración.</strong> El presente contrato tendrá vigencia por 90 días naturales. Entrepeques queda libre de responsabilidad sobre artículos no recogidos pasados 3 meses del vencimiento.</p>
          
          <p><strong>CUARTA. Forma y lugar de pago.</strong> El pago del 50% del precio de venta se realizará a más tardar el día 30 del mes siguiente a la venta, en efectivo en tienda o por transferencia electrónica.</p>
          
          <p><strong>QUINTA. Devolución.</strong> El Consignante puede solicitar la devolución pasados 60 días, pagando el 10% del precio de venta por gastos de almacenaje.</p>
          
          <p><strong>SEXTA. Transmisión de la propiedad.</strong> Al efectuarse la venta a un tercero, el Consignante transmite la propiedad directamente al comprador.</p>
          
          <p><strong>SÉPTIMA. Riesgos.</strong> Serán por cuenta del Consignante todos los riesgos del producto, sin responsabilidad para el Consignatario por pérdida, deterioro o daño.</p>
          
          <p><strong>OCTAVA. Jurisdicción.</strong> Las partes se someten a los tribunales competentes de la Ciudad de México para cualquier controversia.</p>
        </div>
      </div>

      {/* Información de pago */}
      <div className="contrato-section payment-info">
        <h3>INFORMACIÓN PARA PAGO</h3>
        <div className="payment-options">
          <p>☐ Pago en efectivo en tienda: Homero 1616, Col. Los Morales, Polanco, CDMX. Tel: 55-6588-3245</p>
          <p>☐ Transferencia electrónica:</p>
          <div className="bank-info">
            <div className="info-row">
              <span className="label">Banco:</span>
              <span className="value">_________________________________</span>
              <span className="label" style={{marginLeft: '20px'}}>CLABE:</span>
              <span className="value">_______________________________</span>
            </div>
            <div className="info-row">
              <span className="label">Titular:</span>
              <span className="value">________________________________________________________________________</span>
            </div>
          </div>
        </div>
      </div>

      {/* Firmas */}
      <div className="contrato-section signatures">
        <p className="signature-date">El presente contrato se celebra en la Ciudad de México el día {currentDate}</p>
        
        <div className="signature-blocks">
          <div className="signature-block">
            <div className="signature-line"></div>
            <p>EL CONSIGNATARIO</p>
            <p className="signature-name">Pablo Alberto Quiroz León</p>
            <p className="signature-title">Entrepeques</p>
          </div>
          
          <div className="signature-block">
            <div className="signature-line"></div>
            <p>EL CONSIGNANTE</p>
            <p className="signature-name">{client?.name || 'Nombre del consignante'}</p>
            <p className="signature-title">Por su propio derecho</p>
          </div>
        </div>
      </div>

      {/* Botones de acción (no se imprimen) */}
      <div className="no-print mt-8 flex justify-center gap-4">
        <button
          onClick={() => {
            // Crear una nueva ventana solo con el contenido del contrato
            const printWindow = window.open('', '_blank', 'width=900,height=800');

            if (printWindow) {
              // Obtener el HTML del contrato
              const contractContent = document.querySelector('#contrato-consignacion').outerHTML;

              printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Contrato de Consignación - Entrepeques</title>
                  <style>
                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }

                    body {
                      font-family: Arial, sans-serif;
                      background: white;
                      padding: 20px;
                    }

                    .no-print {
                      text-align: center;
                      margin: 20px 0;
                    }

                    .no-print button {
                      background: #9b59b6;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 5px;
                      cursor: pointer;
                      margin: 0 10px;
                      font-size: 14px;
                    }

                    .no-print button:hover {
                      background: #8e44ad;
                    }

                    .contrato-container {
                      font-family: Arial, sans-serif;
                      font-size: 11pt;
                      line-height: 1.4;
                      color: #000;
                      background: white;
                      padding: 20px;
                      max-width: 800px;
                      margin: 0 auto;
                    }

                    .contrato-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 30px;
                      padding-bottom: 20px;
                      border-bottom: 2px solid #333;
                    }

                    .logo-section {
                      flex: 0 0 auto;
                    }

                    .contract-title {
                      text-align: center;
                      flex: 1;
                    }

                    .contract-title h2 {
                      font-size: 16pt;
                      margin: 0;
                      font-weight: bold;
                    }

                    .contract-number {
                      font-size: 10pt;
                      color: #666;
                      margin-top: 5px;
                    }

                    .contrato-section {
                      margin-bottom: 25px;
                    }

                    .contrato-section h3 {
                      font-size: 12pt;
                      font-weight: bold;
                      margin-bottom: 10px;
                      padding: 5px;
                      background: #f0f0f0;
                      border-left: 4px solid #ff6b9d;
                    }

                    .client-info {
                      padding: 10px;
                    }

                    .info-row {
                      margin-bottom: 8px;
                      display: flex;
                      align-items: baseline;
                    }

                    .label {
                      font-weight: bold;
                      margin-right: 10px;
                      min-width: 100px;
                    }

                    .value {
                      flex: 1;
                      border-bottom: 1px solid #999;
                      padding-bottom: 2px;
                      min-height: 20px;
                    }

                    .products-table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 10px;
                    }

                    .products-table th {
                      background: #f0f0f0;
                      padding: 8px;
                      border: 1px solid #ccc;
                      font-weight: bold;
                      font-size: 10pt;
                    }

                    .products-table td {
                      padding: 6px;
                      border: 1px solid #ccc;
                      font-size: 10pt;
                    }

                    .products-table .center {
                      text-align: center;
                    }

                    .products-table .price {
                      text-align: right;
                      white-space: nowrap;
                    }

                    .products-table tfoot td {
                      font-weight: bold;
                      background: #f9f9f9;
                    }

                    .total-label {
                      text-align: right;
                      padding-right: 10px;
                    }

                    .total-price {
                      text-align: right;
                      font-size: 12pt;
                    }

                    .conditions ul {
                      margin: 10px 0;
                      padding-left: 25px;
                    }

                    .conditions li {
                      margin-bottom: 8px;
                      text-align: justify;
                    }

                    .legal-text {
                      font-size: 9pt;
                      text-align: justify;
                      line-height: 1.3;
                    }

                    .legal-text p {
                      margin: 8px 0;
                    }

                    .legal-text ol {
                      margin: 5px 0 10px 20px;
                      padding-left: 10px;
                    }

                    .legal-text li {
                      margin-bottom: 5px;
                    }

                    .payment-options {
                      padding: 10px;
                      background: #f9f9f9;
                      border: 1px solid #ddd;
                    }

                    .payment-options p {
                      margin: 8px 0;
                    }

                    .bank-info {
                      margin-left: 20px;
                      padding: 10px;
                    }

                    .signatures {
                      margin-top: 40px;
                    }

                    .signature-date {
                      text-align: center;
                      margin-bottom: 40px;
                      font-style: italic;
                    }

                    .signature-blocks {
                      display: flex;
                      justify-content: space-around;
                      margin-top: 60px;
                    }

                    .signature-block {
                      text-align: center;
                      width: 250px;
                    }

                    .signature-line {
                      border-bottom: 1px solid #000;
                      margin-bottom: 5px;
                      height: 40px;
                    }

                    .signature-block p {
                      margin: 3px 0;
                      font-size: 10pt;
                    }

                    .signature-name {
                      font-weight: bold;
                    }

                    .signature-title {
                      font-style: italic;
                      font-size: 9pt;
                    }

                    @media print {
                      body {
                        padding: 0;
                        margin: 0;
                      }

                      .no-print {
                        display: none !important;
                      }

                      .contrato-container {
                        padding: 0.5in;
                        margin: 0;
                        font-size: 10pt;
                        max-width: none;
                      }

                      .contrato-header {
                        page-break-after: avoid;
                      }

                      .contrato-section {
                        page-break-inside: avoid;
                      }

                      .terms {
                        page-break-before: always;
                      }

                      .signatures {
                        page-break-inside: avoid;
                      }

                      .contrato-section h3 {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                      }
                    }

                    @page {
                      size: letter;
                      margin: 0.75in;
                    }
                  </style>
                </head>
                <body>
                  ${contractContent}
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
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
          Imprimir Contrato
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

      {/* Estilos CSS para impresión */}
      <style>{`
        .contrato-container {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
          background: white;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .contrato-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }

        .logo-section {
          flex: 0 0 auto;
        }

        .contract-title {
          text-align: center;
          flex: 1;
        }

        .contract-title h2 {
          font-size: 16pt;
          margin: 0;
          font-weight: bold;
        }

        .contract-number {
          font-size: 10pt;
          color: #666;
          margin-top: 5px;
        }

        .contrato-section {
          margin-bottom: 25px;
        }

        .contrato-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 10px;
          padding: 5px;
          background: #f0f0f0;
          border-left: 4px solid #ff6b9d;
        }

        .client-info {
          padding: 10px;
        }

        .info-row {
          margin-bottom: 8px;
          display: flex;
          align-items: baseline;
        }

        .label {
          font-weight: bold;
          margin-right: 10px;
          min-width: 100px;
        }

        .value {
          flex: 1;
          border-bottom: 1px solid #999;
          padding-bottom: 2px;
          min-height: 20px;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .products-table th {
          background: #f0f0f0;
          padding: 8px;
          border: 1px solid #ccc;
          font-weight: bold;
          font-size: 10pt;
        }

        .products-table td {
          padding: 6px;
          border: 1px solid #ccc;
          font-size: 10pt;
        }

        .products-table .center {
          text-align: center;
        }

        .products-table .price {
          text-align: right;
          white-space: nowrap;
        }

        .products-table tfoot td {
          font-weight: bold;
          background: #f9f9f9;
        }

        .total-label {
          text-align: right;
          padding-right: 10px;
        }

        .total-price {
          text-align: right;
          font-size: 12pt;
        }

        .conditions ul {
          margin: 10px 0;
          padding-left: 25px;
        }

        .conditions li {
          margin-bottom: 8px;
          text-align: justify;
        }

        .legal-text {
          font-size: 9pt;
          text-align: justify;
          line-height: 1.3;
        }

        .legal-text p {
          margin: 8px 0;
        }

        .legal-text ol {
          margin: 5px 0 10px 20px;
          padding-left: 10px;
        }

        .legal-text li {
          margin-bottom: 5px;
        }

        .payment-options {
          padding: 10px;
          background: #f9f9f9;
          border: 1px solid #ddd;
        }

        .payment-options p {
          margin: 8px 0;
        }

        .bank-info {
          margin-left: 20px;
          padding: 10px;
        }

        .signatures {
          margin-top: 40px;
        }

        .signature-date {
          text-align: center;
          margin-bottom: 40px;
          font-style: italic;
        }

        .signature-blocks {
          display: flex;
          justify-content: space-around;
          margin-top: 60px;
        }

        .signature-block {
          text-align: center;
          width: 250px;
        }

        .signature-line {
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
          height: 40px;
        }

        .signature-block p {
          margin: 3px 0;
          font-size: 10pt;
        }

        .signature-name {
          font-weight: bold;
        }

        .signature-title {
          font-style: italic;
          font-size: 9pt;
        }
      `}</style>
    </div>
  );
};

export default ContratoConsignacion;