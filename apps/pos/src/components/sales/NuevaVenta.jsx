import React, { useState, useEffect } from 'react';
import { SalesService } from '../../services/sales.service';
import { ClientService } from '../../services/client.service';
import SearchProducts from './SearchProducts';
import ClientSelection from './ClientSelection';
import PaymentMethod from './PaymentMethod';
import SaleConfirmation from './SaleConfirmation';

const salesService = new SalesService();
const clientService = new ClientService();

export default function NuevaVenta() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [client, setClient] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [saleComplete, setSaleComplete] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calcular total del carrito
  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity_sold), 0);

  // Validar que los pagos mixtos coincidan con el total
  const isPaymentValid = () => {
    if (paymentMethod !== 'mixto') return true;
    if (paymentDetails.length === 0) return false;

    const paymentSum = paymentDetails.reduce((sum, p) => sum + (p.amount || 0), 0);
    return Math.abs(paymentSum - cartTotal) <= 0.01;
  };

  // Manejar siguiente paso
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Manejar paso anterior
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Procesar venta
  const processSale = async () => {
    setLoading(true);
    setError('');

    try {
      const saleData = {
        client_id: client?.id || null,
        client_name: client?.name || 'Cliente Ocasional',
        items: cart.map(item => ({
          inventario_id: item.id,
          quantity_sold: item.quantity_sold,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity_sold
        })),
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'mixto' ? paymentDetails : null,
        location: 'Polanco',
        notes: ''
      };

      const result = await salesService.createSale(saleData);
      
      if (result) {
        setCompletedSale(result);
        setSaleComplete(true);
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      setError(error.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar venta
  const resetSale = () => {
    setCurrentStep(1);
    setCart([]);
    setClient(null);
    setPaymentMethod('efectivo');
    setPaymentDetails([]);
    setSaleComplete(false);
    setCompletedSale(null);
    setError('');
  };

  // Si la venta está completa, mostrar confirmación
  if (saleComplete && completedSale) {
    return (
      <SaleConfirmation 
        sale={completedSale} 
        onNewSale={resetSale}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { number: 1, title: 'Productos' },
            { number: 2, title: 'Cliente' },
            { number: 3, title: 'Pago' },
            { number: 4, title: 'Confirmar' }
          ].map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-pink-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <SearchProducts cart={cart} setCart={setCart} />
        )}
        
        {currentStep === 2 && (
          <ClientSelection client={client} setClient={setClient} />
        )}
        
        {currentStep === 3 && (
          <PaymentMethod 
            total={cartTotal}
            client={client}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
          />
        )}
        
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Resumen de Venta</h3>
            
            {/* Productos */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Productos</h4>
              <div className="border rounded-lg p-4 space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description} x{item.quantity_sold}</span>
                    <span>${(item.unit_price * item.quantity_sold).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Cliente */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cliente</h4>
              <div className="border rounded-lg p-4">
                <p className="text-sm">
                  {client ? (
                    <>
                      <span className="font-medium">{client.name}</span>
                      {client.phone && <span className="text-gray-600 ml-2">Tel: {client.phone}</span>}
                    </>
                  ) : (
                    <span className="text-gray-600">Cliente Ocasional</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Método de Pago */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Método de Pago</h4>
              <div className="border rounded-lg p-4">
                <p className="text-sm capitalize">
                  {paymentMethod === 'credito_tienda' ? 'Crédito en Tienda' : paymentMethod}
                </p>
                {paymentMethod === 'mixto' && paymentDetails.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {paymentDetails.map((detail, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {detail.payment_method === 'credito_tienda' ? 'Crédito en Tienda' : detail.payment_method}: ${detail.amount.toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? resetSale : handlePrevStep}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && cart.length === 0) ||
              (currentStep === 3 && !isPaymentValid())
            }
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={processSale}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Procesar Venta'}
          </button>
        )}
      </div>
    </div>
  );
}