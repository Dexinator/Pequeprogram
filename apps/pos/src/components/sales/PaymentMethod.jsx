import React, { useState, useEffect } from 'react';

export default function PaymentMethod({ total, client, paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails }) {
  const [mixedPayments, setMixedPayments] = useState([
    { payment_method: 'efectivo', amount: 0 }
  ]);
  const [paymentError, setPaymentError] = useState('');

  // Actualizar payment details cuando cambian los pagos mixtos
  useEffect(() => {
    if (paymentMethod === 'mixto') {
      setPaymentDetails(mixedPayments.filter(p => p.amount > 0));
    }
  }, [mixedPayments, paymentMethod, setPaymentDetails]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentError('');
    if (method !== 'mixto') {
      setMixedPayments([{ payment_method: 'efectivo', amount: 0 }]);
    }
    
    // Validar si se selecciona crédito en tienda
    if (method === 'credito_tienda' && total > clientStoreCredit) {
      setPaymentError(`El total ($${total.toFixed(2)}) excede el crédito disponible ($${clientStoreCredit.toFixed(2)}). Use pago mixto para combinar con otro método.`);
      setPaymentMethod('mixto');
      setMixedPayments([
        { payment_method: 'credito_tienda', amount: clientStoreCredit },
        { payment_method: 'efectivo', amount: total - clientStoreCredit }
      ]);
    }
  };

  const addPaymentMethod = () => {
    setMixedPayments([...mixedPayments, { payment_method: 'tarjeta', amount: 0 }]);
  };

  const removePaymentMethod = (index) => {
    setMixedPayments(mixedPayments.filter((_, i) => i !== index));
  };

  const updatePaymentMethod = (index, field, value) => {
    const updated = [...mixedPayments];
    if (field === 'amount') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    
    // Validar crédito en tienda
    const creditPayments = updated.filter(p => p.payment_method === 'credito_tienda');
    const totalCreditUsed = creditPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalCreditUsed > clientStoreCredit) {
      setPaymentError(`El crédito usado ($${totalCreditUsed.toFixed(2)}) excede el disponible ($${clientStoreCredit.toFixed(2)})`);
      return;
    }
    
    setMixedPayments(updated);
    
    // Validar que la suma sea correcta
    const sum = updated.reduce((acc, p) => acc + p.amount, 0);
    if (Math.abs(sum - total) > 0.01) {
      setPaymentError(`La suma de pagos ($${sum.toFixed(2)}) no coincide con el total ($${total.toFixed(2)})`);
    } else {
      setPaymentError('');
    }
  };

  const clientStoreCredit = client?.store_credit ? parseFloat(client.store_credit) : 0;
  const hasStoreCredit = clientStoreCredit > 0;

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
    { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
    ...(hasStoreCredit ? [{ value: 'credito_tienda', label: 'Crédito en Tienda', icon: '🎫' }] : []),
    { value: 'mixto', label: 'Pago Mixto', icon: '🔄' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Método de Pago</h3>

      {/* Total a pagar */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Total a pagar</p>
        <p className="text-2xl font-bold text-pink-600">${total.toFixed(2)}</p>
      </div>

      {/* Crédito disponible */}
      {hasStoreCredit && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Crédito disponible</p>
          <p className="text-xl font-bold text-green-600">${clientStoreCredit.toFixed(2)}</p>
        </div>
      )}
      
      {/* Advertencia si no hay cliente registrado */}
      {!client && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Solo clientes registrados pueden usar crédito en tienda
          </p>
        </div>
      )}

      {/* Métodos de pago */}
      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map(method => (
          <button
            key={method.value}
            onClick={() => handlePaymentMethodChange(method.value)}
            className={`p-4 border rounded-lg text-center transition-colors ${
              paymentMethod === method.value
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">{method.icon}</div>
            <div className="font-medium">{method.label}</div>
          </button>
        ))}
      </div>

      {/* Configuración de pago mixto */}
      {paymentMethod === 'mixto' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Detalles del Pago Mixto</h4>
          
          {paymentError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {paymentError}
            </div>
          )}

          {mixedPayments.map((payment, index) => (
            <div key={index} className="flex items-center space-x-3">
              <select
                value={payment.payment_method}
                onChange={(e) => updatePaymentMethod(index, 'payment_method', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                {hasStoreCredit && <option value="credito_tienda">Crédito en Tienda</option>}
              </select>
              
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => updatePaymentMethod(index, 'amount', e.target.value)}
                  className="w-32 p-2 pl-8 border border-gray-300 rounded"
                  step="0.01"
                  min="0"
                />
              </div>
              
              {mixedPayments.length > 1 && (
                <button
                  onClick={() => removePaymentMethod(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addPaymentMethod}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-pink-500 hover:text-pink-600"
          >
            + Agregar método de pago
          </button>

          {/* Resumen de pagos */}
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm space-y-1">
              {mixedPayments.filter(p => p.amount > 0).map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize">
                    {payment.payment_method === 'credito_tienda' ? 'Crédito en Tienda' : payment.payment_method}:
                  </span>
                  <span>${payment.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-1 font-medium flex justify-between">
                <span>Total pagos:</span>
                <span className={paymentError ? 'text-red-600' : 'text-green-600'}>
                  ${mixedPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}