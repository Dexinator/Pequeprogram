import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  const handleCheckout = () => {
    if (items.length > 0) {
      setIsLoading(true);
      window.location.href = '/checkout';
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">¡Agrega algunos productos para comenzar!</p>
          <a href="/productos" className="inline-block bg-brand-rosa hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Ver productos
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Lista de productos */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Productos ({itemCount})
              </h2>
              {items.length > 2 && (
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                      clearCart();
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <div key={item.inventory_id} className="p-6">
                <div className="flex items-start space-x-4">
                  <a href={`/producto/${item.inventory_id}`} className="flex-shrink-0">
                    <img 
                      src={item.image || '/placeholder-product.svg'} 
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </a>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {item.brand_name}
                    </p>
                    <p className="text-lg font-bold text-brand-rosa">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <button
                      onClick={() => removeItem(item.inventory_id)}
                      className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                      aria-label="Eliminar del carrito"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.inventory_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.inventory_id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_quantity}
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Resumen del pedido */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sticky top-24">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Resumen del pedido
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal ({itemCount} productos):</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Envío:</span>
              <span className="font-medium text-green-600 dark:text-green-400">Gratis</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
              <span>Total:</span>
              <span className="text-brand-rosa">{formatPrice(total)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={isLoading || items.length === 0}
            className="w-full bg-brand-rosa hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : 'Proceder al pago'}
          </button>
          
          <a 
            href="/productos" 
            className="block text-center mt-4 text-brand-azul hover:text-brand-azul-dark dark:text-brand-azul-light dark:hover:text-brand-azul transition-colors"
          >
            ← Continuar comprando
          </a>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Pago seguro:</strong> Procesamos tu pago de forma segura con MercadoPago.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;