import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  return (
    <>
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors"
        aria-label="Carrito de compras"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
      
      {/* Drawer del carrito */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Carrito de compras</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.inventory_id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      <a href={`/producto/${item.inventory_id}`} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </a>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">{item.brand_name}</p>
                        <p className="font-medium text-pink-600">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.inventory_id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Eliminar del carrito"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.inventory_id, item.quantity - 1)}
                            className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.inventory_id, item.quantity + 1)}
                            disabled={item.quantity >= item.max_quantity}
                            className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {items.length > 3 && (
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer con total y botón de checkout */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    * El envío se calculará en el siguiente paso
                  </p>
                </div>
                
                <div className="space-y-2">
                  <a
                    href="/checkout"
                    className="block w-full bg-pink-600 text-white text-center py-3 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Proceder al pago
                  </a>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Continuar comprando
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;