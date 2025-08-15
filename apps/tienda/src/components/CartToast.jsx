import React, { useState, useEffect } from 'react';

const CartToast = () => {
  const [show, setShow] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const handleProductAdded = (event) => {
      setProduct(event.detail);
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, 3000);
    };

    window.addEventListener('product_added_to_cart', handleProductAdded);

    return () => {
      window.removeEventListener('product_added_to_cart', handleProductAdded);
    };
  }, []);

  if (!show || !product) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-sm border-2 border-brand-verde-lima">
        <div className="flex-shrink-0 w-12 h-12 bg-brand-verde-lima rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-gray-800 dark:text-gray-100">
            ¡Agregado al carrito!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {product.name}
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartToast;