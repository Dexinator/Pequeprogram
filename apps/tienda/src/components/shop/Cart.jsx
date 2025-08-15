import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  const [removingItem, setRemovingItem] = useState(null);
  
  // Prevenir scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const handleRemoveItem = async (inventoryId) => {
    setRemovingItem(inventoryId);
    setTimeout(() => {
      removeItem(inventoryId);
      setRemovingItem(null);
    }, 300);
  };

  // Categorías con colores asociados según el diseño de Entrepeques
  const getCategoryColor = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('ropa') || name.includes('playera') || name.includes('pantalón')) {
      return 'bg-brand-rosa/10 border-brand-rosa';
    }
    if (name.includes('juguete') || name.includes('juego')) {
      return 'bg-brand-amarillo/10 border-brand-amarillo';
    }
    if (name.includes('cuna') || name.includes('cama') || name.includes('dormir')) {
      return 'bg-brand-azul/10 border-brand-azul';
    }
    if (name.includes('carriola') || name.includes('pasear')) {
      return 'bg-brand-verde-lima/10 border-brand-verde-lima';
    }
    return 'bg-gray-50 border-gray-200';
  };
  
  return (
    <>
      {/* Botón del carrito flotante con animación */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 group"
        aria-label="Carrito de compras"
      >
        <svg 
          className="w-6 h-6 text-brand-azul group-hover:text-brand-rosa transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-rosa text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-md">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      
      {/* Overlay oscuro */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Drawer del carrito - Full screen en móvil, lateral en desktop */}
      <div className={`
        fixed right-0 top-0 z-50 h-full bg-white dark:bg-gray-900 shadow-2xl
        transition-transform duration-300 ease-in-out
        w-full sm:w-96 md:w-[28rem]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header del carrito */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛒</span>
              <div>
                <h2 className="text-xl font-heading font-bold text-brand-azul dark:text-brand-azul-light">
                  Mi Carrito
                </h2>
                {itemCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              aria-label="Cerrar carrito"
            >
              <svg 
                className="w-6 h-6 text-gray-500 group-hover:text-brand-rosa transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contenido del carrito */}
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            /* Estado vacío mejorado */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-brand-azul/20 to-brand-verde-lima/20 flex items-center justify-center">
                <svg 
                  className="w-16 h-16 text-brand-azul" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                ¡Encuentra productos increíbles para tu pequeño!
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-brand-azul to-brand-verde-lima text-white px-8 py-3 rounded-full font-heading font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <>
              {/* Lista de productos con scroll */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {/* Opción de limpiar carrito si hay más de 2 items */}
                {items.length > 2 && (
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de vaciar tu carrito?')) {
                        clearCart();
                      }
                    }}
                    className="w-full text-center text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 py-2 transition-colors"
                  >
                    🗑️ Vaciar carrito
                  </button>
                )}
                
                {items.map((item) => (
                  <div
                    key={item.inventory_id}
                    className={`
                      relative bg-white dark:bg-gray-800 rounded-xl p-3 border-2 
                      ${getCategoryColor(item.product_name)}
                      transition-all duration-300
                      ${removingItem === item.inventory_id ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* Imagen del producto */}
                      <a 
                        href={`/producto/${item.inventory_id}`}
                        className="flex-shrink-0 block"
                        onClick={() => setIsOpen(false)}
                      >
                        <img
                          src={item.image || '/placeholder-product.svg'}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        />
                      </a>
                      
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1 truncate">
                          {item.product_name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {item.brand_name}
                        </p>
                        <p className="font-bold text-brand-rosa text-lg">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleRemoveItem(item.inventory_id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Controles de cantidad - Mobile friendly */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Cantidad:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.inventory_id, item.quantity - 1)}
                          className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-brand-azul/20 dark:hover:bg-brand-azul/20 flex items-center justify-center transition-colors text-lg font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.inventory_id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_quantity}
                          className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-brand-verde-lima/20 dark:hover:bg-brand-verde-lima/20 flex items-center justify-center transition-colors text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal por item */}
                    {item.quantity > 1 && (
                      <div className="text-right mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Subtotal: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Espaciado para el footer sticky */}
                <div className="h-4"></div>
              </div>
              
              {/* Footer sticky con total y checkout */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Resumen de compra */}
                <div className="bg-gradient-to-r from-brand-azul/10 to-brand-verde-lima/10 dark:from-brand-azul/5 dark:to-brand-verde-lima/5 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                    <span className="text-brand-verde-lima font-semibold">¡Gratis!</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-lg font-heading font-bold">Total:</span>
                    <span className="text-2xl font-bold text-brand-rosa">{formatPrice(total)}</span>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="space-y-2">
                  <a
                    href="/checkout"
                    className="block w-full bg-gradient-to-r from-brand-rosa to-brand-rosa/80 hover:from-brand-rosa/90 hover:to-brand-rosa text-white text-center py-4 rounded-xl font-heading font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                  >
                    Finalizar compra 🎉
                  </a>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 text-gray-600 dark:text-gray-400 hover:text-brand-azul dark:hover:text-brand-azul-light font-medium transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
                
                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pago seguro
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    Envío rápido
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;