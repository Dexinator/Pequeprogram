import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addItem, isItemInCart } = useCart();
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  // Obtener estado del producto con colores
  const getConditionBadge = (condition) => {
    const conditions = {
      'excelente': { text: 'Excelente', class: 'bg-green-100 text-green-800' },
      'bueno': { text: 'Bueno', class: 'bg-blue-100 text-blue-800' },
      'regular': { text: 'Regular', class: 'bg-yellow-100 text-yellow-800' }
    };
    return conditions[condition] || conditions['regular'];
  };
  
  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Obtener imagen principal
  const getMainImage = () => {
    if (!product.images || product.images.length === 0 || imageError) {
      return 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Sin+imagen';
    }
    return product.images[currentImageIndex];
  };
  
  // Calcular descuento si existe
  const hasDiscount = product.discount_percentage > 0;
  const originalPrice = hasDiscount 
    ? product.online_price / (1 - product.discount_percentage / 100)
    : product.online_price;
  
  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Badge de descuento */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
          -{product.discount_percentage}%
        </div>
      )}
      
      {/* Badge de stock */}
      {product.quantity === 1 && (
        <div className="absolute top-2 right-2 z-10 bg-pink-500 text-white px-2 py-1 rounded-md text-xs">
          Pieza única
        </div>
      )}
      {product.quantity > 1 && product.quantity <= 3 && (
        <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-md text-xs">
          Últimas {product.quantity} piezas
        </div>
      )}
      
      {/* Imagen del producto */}
      <a href={`/producto/${product.inventory_id}`} className="block aspect-square overflow-hidden bg-gray-100">
        <img
          src={getMainImage()}
          alt={product.subcategory_name}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Segunda imagen al hover (si existe) */}
        {product.images && product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.subcategory_name} - vista 2`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
        )}
      </a>
      
      {/* Información del producto */}
      <div className="p-4">
        <a href={`/producto/${product.inventory_id}`} className="block">
          {/* Categoría y subcategoría */}
          <p className="text-xs text-gray-500 mb-1">
            {product.category_name} • {product.subcategory_name}
          </p>
          
          {/* Marca */}
          <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2 mb-2">
            {product.brand_name}
          </h3>
          
          {/* Características destacadas */}
          {product.features && (
            <div className="text-xs text-gray-600 mb-2 space-y-1">
              {Object.entries(product.features)
                .slice(0, 2)
                .map(([key, value]) => (
                  <p key={key} className="truncate">
                    {key}: {value}
                  </p>
                ))}
            </div>
          )}
          
          {/* Estado */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-block px-2 py-1 text-xs rounded ${getConditionBadge(product.condition_state).class}`}>
              {getConditionBadge(product.condition_state).text}
            </span>
          </div>
          
          {/* Precios */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount ? (
                <>
                  <p className="text-lg font-bold text-pink-600">
                    {formatPrice(product.online_price)}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(product.online_price)}
                </p>
              )}
            </div>
            
            {/* Botón de agregar al carrito */}
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, 1);
                setShowAddedMessage(true);
                setTimeout(() => setShowAddedMessage(false), 2000);
              }}
              disabled={product.quantity === 0}
              className={`p-2 rounded-lg transition-all ${
                product.quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isItemInCart(product.inventory_id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
              aria-label="Agregar al carrito"
            >
              {isItemInCart(product.inventory_id) ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          </div>
        </a>
      </div>
      
      {/* Mensaje de agregado al carrito */}
      {showAddedMessage && (
        <div className="absolute top-2 left-2 right-2 bg-green-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-fade-in-out">
          ¡Agregado al carrito!
        </div>
      )}
    </div>
  );
};

export default ProductCard;