import React, { useState, useEffect } from 'react';
import { salesService } from '../services/sales.service';
import { ValuationService } from '../services/valuation.service';

const valuationService = new ValuationService();

const NuevaVenta = () => {
  const [step, setStep] = useState(1); // 1: Productos, 2: Cliente, 3: Pago, 4: Confirmación
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clientData, setClientData] = useState({
    type: 'ocasional', // 'ocasional' o 'registrado'
    client_id: null,
    client_name: '',
    searchTerm: ''
  });
  const [clients, setClients] = useState([]);
  const [paymentData, setPaymentData] = useState({
    payment_method: 'efectivo',
    notes: '',
    // Para pagos mixtos
    mixedPayments: {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Buscar productos en inventario
  const searchProducts = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await salesService.getAvailableInventory({
        q: term,
        limit: 10
      });
      setSearchResults(response.items);
    } catch (error) {
      console.error('Error buscando productos:', error);
      alert('Error al buscar productos');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.inventario_id === product.id);
    
    if (existingItem) {
      // Verificar que no exceda el stock disponible
      if (existingItem.quantity_sold >= product.quantity) {
        alert('No hay suficiente stock disponible');
        return;
      }
      
      setCart(cart.map(item => 
        item.inventario_id === product.id 
          ? { ...item, quantity_sold: item.quantity_sold + 1, total_price: (item.quantity_sold + 1) * item.unit_price }
          : item
      ));
    } else {
      const newItem = {
        inventario_id: product.id,
        quantity_sold: 1,
        unit_price: product.valuation_item?.final_sale_price || 0,
        total_price: product.valuation_item?.final_sale_price || 0,
        product_info: product.valuation_item,
        available_quantity: product.quantity,
        description: salesService.getProductDescription(product)
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };

  // Actualizar cantidad en carrito
  const updateCartQuantity = (inventario_id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(inventario_id);
      return;
    }

    const item = cart.find(item => item.inventario_id === inventario_id);
    if (newQuantity > item.available_quantity) {
      alert('No hay suficiente stock disponible');
      return;
    }

    setCart(cart.map(item => 
      item.inventario_id === inventario_id 
        ? { ...item, quantity_sold: newQuantity, total_price: newQuantity * item.unit_price }
        : item
    ));
  };

  // Función updateCartPrice eliminada - los precios ya no son editables

  // Remover del carrito
  const removeFromCart = (inventario_id) => {
    setCart(cart.filter(item => item.inventario_id !== inventario_id));
  };

  // Calcular total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  // Calcular total de pagos mixtos
  const calculateMixedPaymentsTotal = () => {
    return Object.values(paymentData.mixedPayments).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
  };

  // Actualizar pago mixto
  const updateMixedPayment = (method, amount) => {
    setPaymentData({
      ...paymentData,
      mixedPayments: {
        ...paymentData.mixedPayments,
        [method]: parseFloat(amount) || 0
      }
    });
  };

  // Validar pagos mixtos
  const validateMixedPayments = () => {
    const total = calculateTotal();
    const paymentsTotal = calculateMixedPaymentsTotal();
    return Math.abs(total - paymentsTotal) < 0.01; // Tolerancia de 1 centavo
  };

  // Buscar clientes
  const searchClients = async (term) => {
    if (!term.trim()) {
      setClients([]);
      return;
    }

    try {
      const response = await valuationService.searchClients(term);
      setClients(response);
    } catch (error) {
      console.error('Error buscando clientes:', error);
    }
  };

  // Buscar clientes con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientData.type === 'registrado') {
        searchClients(clientData.searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientData.searchTerm, clientData.type]);

  // Procesar venta
  const processSale = async () => {
    if (cart.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }

    if (clientData.type === 'ocasional' && !clientData.client_name.trim()) {
      alert('Ingrese el nombre del cliente');
      return;
    }

    if (clientData.type === 'registrado' && !clientData.client_id) {
      alert('Seleccione un cliente registrado');
      return;
    }

    // Validar pagos mixtos
    if (paymentData.payment_method === 'mixto') {
      if (!validateMixedPayments()) {
        const total = calculateTotal();
        const paymentsTotal = calculateMixedPaymentsTotal();
        alert(`El total de los pagos ($${paymentsTotal.toFixed(2)}) no coincide con el total de la venta ($${total.toFixed(2)})`);
        return;
      }
      
      // Verificar que al menos un método tenga cantidad > 0
      const hasPayments = Object.values(paymentData.mixedPayments).some(amount => amount > 0);
      if (!hasPayments) {
        alert('Debe ingresar al menos un monto para el pago mixto');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Crear payment_details según el tipo de pago
      let payment_details = [];
      
      if (paymentData.payment_method === 'mixto') {
        // Para pagos mixtos, crear un payment_detail por cada método con cantidad > 0
        Object.entries(paymentData.mixedPayments).forEach(([method, amount]) => {
          if (amount > 0) {
            payment_details.push({
              payment_method: method,
              amount: amount,
              notes: method === 'tarjeta' ? 'Pago con tarjeta' : method === 'transferencia' ? 'Transferencia bancaria' : null
            });
          }
        });
      } else {
        // Para pagos simples, crear un solo payment_detail
        payment_details.push({
          payment_method: paymentData.payment_method,
          amount: calculateTotal(),
          notes: null
        });
      }

      const saleData = {
        client_id: clientData.type === 'registrado' ? clientData.client_id : undefined,
        client_name: clientData.type === 'ocasional' ? clientData.client_name : undefined,
        payment_method: paymentData.payment_method,
        payment_details: payment_details,
        notes: paymentData.notes,
        items: cart.map(item => ({
          inventario_id: item.inventario_id,
          quantity_sold: item.quantity_sold,
          unit_price: item.unit_price,
          notes: item.notes || ''
        }))
      };

      const sale = await salesService.createSale(saleData);
      setCompletedSale(sale);
      setStep(4);
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar venta
  const resetSale = () => {
    setStep(1);
    setCart([]);
    setSearchTerm('');
    setSearchResults([]);
    setClientData({
      type: 'ocasional',
      client_id: null,
      client_name: '',
      searchTerm: ''
    });
    setPaymentData({
      payment_method: 'efectivo',
      notes: '',
      mixedPayments: {
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0
      }
    });
    setCompletedSale(null);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Buscar Productos</h3>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por ID, categoría, marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((product) => (
              <div key={product.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{salesService.getProductDescription(product)}</p>
                    <p className="text-sm text-gray-600">ID: {product.id}</p>
                    <p className="text-sm text-gray-600">Stock: {product.quantity}</p>
                    <p className="text-sm font-medium text-green-600">
                      {salesService.formatCurrency(product.valuation_item?.final_sale_price || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      {cart.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Carrito de Venta</h3>
          
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.inventario_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-600">ID: {item.inventario_id}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={item.available_quantity}
                    value={item.quantity_sold}
                    onChange={(e) => updateCartQuantity(item.inventario_id, parseInt(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                  />
                  
                  <span className="w-24 p-1 text-center font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded inline-block">
                    {salesService.formatCurrency(item.unit_price)}
                  </span>
                  
                  <span className="w-24 text-center font-medium">
                    {salesService.formatCurrency(item.total_price)}
                  </span>
                  
                  <button
                    onClick={() => removeFromCart(item.inventario_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-green-600">
                {salesService.formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setStep(2)}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Continuar al Cliente
          </button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cliente
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="clientType"
                value="ocasional"
                checked={clientData.type === 'ocasional'}
                onChange={(e) => setClientData({ ...clientData, type: e.target.value, client_id: null, searchTerm: '' })}
                className="mr-2"
              />
              Cliente Ocasional
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="clientType"
                value="registrado"
                checked={clientData.type === 'registrado'}
                onChange={(e) => setClientData({ ...clientData, type: e.target.value, client_name: '' })}
                className="mr-2"
              />
              Cliente Registrado
            </label>
          </div>
        </div>

        {clientData.type === 'ocasional' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={clientData.client_name}
              onChange={(e) => setClientData({ ...clientData, client_name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese el nombre del cliente"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Cliente
            </label>
            <input
              type="text"
              value={clientData.searchTerm}
              onChange={(e) => setClientData({ ...clientData, searchTerm: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar por nombre o teléfono"
            />
            
            {clients.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setClientData({ 
                      ...clientData, 
                      client_id: client.id, 
                      searchTerm: `${client.name} - ${client.phone}`,
                      clients: []
                    })}
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Regresar
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={
            (clientData.type === 'ocasional' && !clientData.client_name.trim()) ||
            (clientData.type === 'registrado' && !clientData.client_id)
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continuar al Pago
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resumen de la Venta</h3>
        
        <div className="space-y-2 mb-4">
          <p><span className="font-medium">Cliente:</span> {clientData.client_name || clients.find(c => c.id === clientData.client_id)?.name}</p>
          <p><span className="font-medium">Items:</span> {cart.length}</p>
          <p><span className="font-medium">Total:</span> <span className="text-green-600 font-bold">{salesService.formatCurrency(calculateTotal())}</span></p>
        </div>
      </div>

      {/* Pago */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          {/* Campos para pago mixto */}
          {paymentData.payment_method === 'mixto' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Desglose del Pago Mixto</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Efectivo:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentData.mixedPayments.efectivo}
                    onChange={(e) => updateMixedPayment('efectivo', e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded text-right"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Tarjeta:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentData.mixedPayments.tarjeta}
                    onChange={(e) => updateMixedPayment('tarjeta', e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded text-right"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Transferencia:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentData.mixedPayments.transferencia}
                    onChange={(e) => updateMixedPayment('transferencia', e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded text-right"
                    placeholder="0.00"
                  />
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Pagos:</span>
                    <span className={`${validateMixedPayments() ? 'text-green-600' : 'text-red-600'}`}>
                      {salesService.formatCurrency(calculateMixedPaymentsTotal())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Venta:</span>
                    <span>{salesService.formatCurrency(calculateTotal())}</span>
                  </div>
                  {!validateMixedPayments() && (
                    <p className="text-xs text-red-600 mt-1">
                      Los pagos deben sumar exactamente el total de la venta
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Notas adicionales sobre la venta..."
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Regresar
          </button>
          <button
            onClick={processSale}
            disabled={isSubmitting || (paymentData.payment_method === 'mixto' && !validateMixedPayments())}
            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
          >
            {isSubmitting ? 'Procesando...' : 'Procesar Venta'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">¡Venta Completada!</h3>
        <p className="text-gray-600">Venta #{completedSale?.id} procesada exitosamente</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
        <h4 className="font-medium mb-2">Detalles de la Venta:</h4>
        <p><span className="font-medium">Total:</span> {salesService.formatCurrency(completedSale?.total_amount || 0)}</p>
        <p><span className="font-medium">Método de Pago:</span> {completedSale?.payment_method}</p>
        
        {/* Mostrar detalles de pago si es mixto */}
        {completedSale?.payment_method === 'mixto' && completedSale?.payment_details && (
          <div className="mt-2 ml-4">
            <span className="text-sm font-medium text-gray-600">Desglose:</span>
            <ul className="text-sm text-gray-600 ml-2">
              {completedSale.payment_details.map((payment, index) => (
                <li key={index}>
                  • {payment.payment_method}: {salesService.formatCurrency(payment.amount)}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <p><span className="font-medium">Items Vendidos:</span> {completedSale?.items?.length || 0}</p>
        <p><span className="font-medium">Fecha:</span> {completedSale ? salesService.formatDate(completedSale.sale_date) : ''}</p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Imprimir Ticket
        </button>
        <button
          onClick={resetSale}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Nueva Venta
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nueva Venta</h2>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-600">
          {step === 1 && 'Paso 1: Seleccionar Productos'}
          {step === 2 && 'Paso 2: Información del Cliente'}
          {step === 3 && 'Paso 3: Método de Pago'}
          {step === 4 && 'Paso 4: Venta Completada'}
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default NuevaVenta;