import React, { useState, useEffect } from 'react';

const METHOD_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  credito_tienda: 'Crédito en Tienda'
};

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function PaymentMethod({ total, subtotal, discountType, setDiscountType, discountValue, setDiscountValue, discountAmount, client, paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails, cashReceived, setCashReceived }) {
  const [mixedPayments, setMixedPayments] = useState([
    { payment_method: 'efectivo', amount: 0 }
  ]);
  const [creditError, setCreditError] = useState('');

  const clientStoreCredit = client?.store_credit ? parseFloat(client.store_credit) : 0;
  const hasStoreCredit = clientStoreCredit > 0;

  // Actualizar payment details cuando cambian los pagos mixtos
  useEffect(() => {
    if (paymentMethod === 'mixto') {
      setPaymentDetails(mixedPayments.filter(p => p.amount > 0));
    }
  }, [mixedPayments, paymentMethod, setPaymentDetails]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setCreditError('');

    // Al cambiar de método, el efectivo capturado deja de tener sentido
    setCashReceived('');

    if (method !== 'mixto') {
      setMixedPayments([{ payment_method: 'efectivo', amount: 0 }]);
    }

    // Si el crédito no alcanza, saltar a mixto con el resto prellenado en efectivo
    if (method === 'credito_tienda' && total > clientStoreCredit) {
      setCreditError(`El total (${money(total)}) excede el crédito disponible (${money(clientStoreCredit)}). Se cambió a pago mixto para combinar con otro método.`);
      setPaymentMethod('mixto');
      setMixedPayments([
        { payment_method: 'credito_tienda', amount: clientStoreCredit },
        { payment_method: 'efectivo', amount: Math.round((total - clientStoreCredit) * 100) / 100 }
      ]);
    }
  };

  const addPaymentMethod = () => {
    setMixedPayments([...mixedPayments, { payment_method: 'tarjeta', amount: 0 }]);
  };

  const removePaymentMethod = (index) => {
    setMixedPayments(mixedPayments.filter((_, i) => i !== index));
  };

  // Copia inmutable: antes se mutaba el objeto dentro del array, lo que dejaba
  // el estado y el importe mostrado desincronizados cuando la validación
  // de crédito cortaba con return.
  const updatePaymentMethod = (index, field, value) => {
    const updated = mixedPayments.map((p, i) => {
      if (i !== index) return p;
      return { ...p, [field]: field === 'amount' ? (parseFloat(value) || 0) : value };
    });

    const totalCreditUsed = updated
      .filter(p => p.payment_method === 'credito_tienda')
      .reduce((sum, p) => sum + p.amount, 0);

    if (totalCreditUsed > clientStoreCredit) {
      setCreditError(`El crédito usado (${money(totalCreditUsed)}) excede el disponible (${money(clientStoreCredit)})`);
      return;
    }

    setCreditError('');
    setMixedPayments(updated);
  };

  // Rellena en este renglón lo que falta para cubrir el total: es la operación
  // que la cajera hace a mano en cada venta con pago mixto.
  const fillRemaining = (index) => {
    const others = mixedPayments.reduce(
      (sum, p, i) => (i === index ? sum : sum + p.amount),
      0
    );
    const missing = Math.round((total - others) * 100) / 100;
    updatePaymentMethod(index, 'amount', Math.max(0, missing));
  };

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
    { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
    ...(hasStoreCredit ? [{ value: 'credito_tienda', label: 'Crédito en Tienda', icon: '🎫' }] : []),
    { value: 'mixto', label: 'Pago Mixto', icon: '🔄' }
  ];

  // --- Faltante / sobrante del pago mixto (derivado, siempre consistente) ---
  const paidSum = mixedPayments.reduce((sum, p) => sum + p.amount, 0);
  const difference = Math.round((total - paidSum) * 100) / 100; // > 0 falta, < 0 sobra
  const isBalanced = Math.abs(difference) <= 0.01;

  // --- Efectivo recibido y cambio ---
  // En pago mixto el cambio se calcula contra el renglón de efectivo, no contra
  // el total: si pagó $200 con tarjeta y $300 en efectivo con un billete de
  // $500, el cambio es $200.
  const cashCharged = paymentMethod === 'mixto'
    ? mixedPayments.filter(p => p.payment_method === 'efectivo').reduce((sum, p) => sum + p.amount, 0)
    : (paymentMethod === 'efectivo' ? total : 0);
  const acceptsCash = cashCharged > 0;
  const receivedNum = parseFloat(cashReceived);
  const hasReceived = cashReceived !== '' && cashReceived !== null && cashReceived !== undefined && !isNaN(receivedNum) && receivedNum > 0;
  const change = hasReceived ? Math.round((receivedNum - cashCharged) * 100) / 100 : null;

  // El campo es opcional: si se deja vacío la venta procede igual que siempre.
  const cashBox = acceptsCash && (
    <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700" htmlFor="cash-received">
          Efectivo recibido <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <span className="text-sm text-gray-500">A cobrar en efectivo: {money(cashCharged)}</span>
      </div>
      <div className="relative w-48">
        <span className="absolute left-3 top-2 text-gray-500">$</span>
        <input
          id="cash-received"
          type="number"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          placeholder="0.00"
          className="w-full p-2 pl-8 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          step="0.01"
          min="0"
        />
      </div>
      {hasReceived && change >= 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-gray-600">Cambio</p>
          <p className="text-3xl font-bold text-green-700">{money(change)}</p>
        </div>
      )}
      {hasReceived && change < 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          El efectivo recibido es {money(Math.abs(change))} menor a lo que se cobra en efectivo. Puedes continuar, pero no habrá cambio.
        </p>
      )}
      {!hasReceived && (
        <p className="text-xs text-gray-500">
          Captura el billete con el que paga para ver el cambio. Si lo dejas vacío, la venta se cobra normal.
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Método de Pago</h3>

      {/* Descuento */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-3">
        <p className="text-sm font-medium text-gray-700">Descuento</p>
        <div className="flex items-center gap-3">
          <select
            value={discountType}
            onChange={(e) => {
              const newType = e.target.value;
              setDiscountType(newType);
              if (newType === 'none') setDiscountValue(0);
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
          >
            <option value="none">Sin descuento</option>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed_amount">Importe ($)</option>
          </select>
          {discountType !== 'none' && (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">
                {discountType === 'percentage' ? '%' : '$'}
              </span>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-32 p-2 pl-8 border border-gray-300 rounded"
                step="0.01"
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
              />
            </div>
          )}
        </div>
        {discountAmount > 0 && (
          <div className="text-sm space-y-1 border-t pt-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Descuento{discountType === 'percentage' ? ` (${parseFloat(discountValue) || 0}%)` : ''}</span>
              <span>-{money(discountAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Total a pagar */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Total a pagar</p>
        <p className="text-2xl font-bold text-pink-600">{money(total)}</p>
      </div>

      {/* Crédito disponible */}
      {hasStoreCredit && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Crédito disponible</p>
          <p className="text-xl font-bold text-green-600">{money(clientStoreCredit)}</p>
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

      {/* Efectivo recibido para el método simple */}
      {paymentMethod === 'efectivo' && cashBox}

      {/* Configuración de pago mixto */}
      {paymentMethod === 'mixto' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Detalles del Pago Mixto</h4>

          {creditError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {creditError}
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

              {difference > 0.01 && (
                <button
                  type="button"
                  onClick={() => fillRemaining(index)}
                  title={`Poner aquí los ${money(difference)} que faltan`}
                  className="px-2 py-1 text-xs border border-pink-300 text-pink-600 rounded hover:bg-pink-50 whitespace-nowrap"
                >
                  Completar
                </button>
              )}

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
                  <span>
                    {METHOD_LABELS[payment.payment_method] || payment.payment_method}:
                  </span>
                  <span>{money(payment.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-1 font-medium flex justify-between">
                <span>Total pagos:</span>
                <span className={isBalanced ? 'text-green-600' : 'text-gray-700'}>
                  {money(paidSum)}
                </span>
              </div>
            </div>
          </div>

          {/* Faltante / sobrante: el dato que la cajera necesita leer de un vistazo */}
          {difference > 0.01 ? (
            <div className="bg-amber-50 border border-amber-300 rounded p-3 flex items-center justify-between">
              <span className="font-medium text-amber-900">Falta por cubrir</span>
              <span className="text-2xl font-bold text-amber-700">{money(difference)}</span>
            </div>
          ) : difference < -0.01 ? (
            <div className="bg-red-50 border border-red-300 rounded p-3 flex items-center justify-between">
              <span className="font-medium text-red-900">Los pagos exceden el total por</span>
              <span className="text-2xl font-bold text-red-700">{money(Math.abs(difference))}</span>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-300 rounded p-3 flex items-center justify-between">
              <span className="font-medium text-green-900">Pago completo</span>
              <span className="text-xl font-bold text-green-700">{money(total)}</span>
            </div>
          )}

          {/* Efectivo recibido cuando alguno de los renglones es en efectivo */}
          {cashBox}
        </div>
      )}
    </div>
  );
}
