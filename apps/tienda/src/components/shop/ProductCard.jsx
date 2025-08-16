import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addItem, isItemInCart } = useCart();
  
  // Verificar que el producto existe
  if (!product) {
    console.error('ProductCard: No se recibió producto');
    return null;
  }
  
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  // Obtener estado del producto con colores del design system
  const getConditionBadge = (condition) => {
    const conditions = {
      'excelente': { text: 'Excelente', class: 'bg-brand-verde-lima text-white' },
      'bueno': { text: 'Bueno', class: 'bg-brand-azul text-white' },
      'regular': { text: 'Regular', class: 'bg-brand-amarillo text-gray-900' }
    };
    // Normalizar a minúsculas para comparar
    const normalizedCondition = condition?.toLowerCase() || 'regular';
    return conditions[normalizedCondition] || conditions['regular'];
  };
  
  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Obtener imagen principal
  const getMainImage = () => {
    if (!product.images || product.images.length === 0 || imageError) {
      return 'https://via.placeholder.com/400x400/00A0DD/FFFFFF?text=Sin+imagen';
    }
    return product.images[currentImageIndex];
  };
  
  // Calcular descuento si existe
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const originalPrice = hasDiscount && product.online_price
    ? product.online_price / (1 - product.discount_percentage / 100)
    : product.online_price || 0;
  
  
  // Obtener emoji de categoría
  const getCategoryEmoji = (categoryName) => {
    const categoryEmojis = {
      'A pasear': '🚼',
      'A dormir': '🛏️',
      'A comer': '🍼',
      'A jugar': '🎮',
      'Para mamá': '🤱',
      'Ropa y calzado': '👕'
    };
    return categoryEmojis[categoryName] || '🎁';
  };
  
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden">
      {/* Badge de descuento */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-brand-rosa text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          -{product.discount_percentage}%
        </div>
      )}
      
      {/* Badge de stock */}
      {product.quantity === 1 && (
        <div className="absolute top-3 right-3 z-10 bg-brand-amarillo text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          Pieza única
        </div>
      )}
      {product.quantity > 1 && product.quantity <= 3 && (
        <div className="absolute top-3 right-3 z-10 bg-brand-amarillo text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          Últimas {product.quantity} piezas
        </div>
      )}
      
      {/* Imagen del producto con gradiente de categoría */}
      <a href={`/producto/${product.inventory_id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
        <img
          src={getMainImage()}
          alt={product.subcategory_name}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Segunda imagen al hover (si existe) */}
        {product.images && product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.subcategory_name} - vista 2`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}
      </a>
      
      {/* Información del producto */}
      <div className="p-6">
        <a href={`/producto/${product.inventory_id}`} className="block">
          {/* Categoría con emoji */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{getCategoryEmoji(product.category_name)}</span>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400">
              {product.category_name} • {product.subcategory_name}
            </p>
          </div>
          
          {/* Marca */}
          <h3 className="font-heading text-lg font-bold text-brand-azul dark:text-brand-azul-light group-hover:text-brand-azul-profundo transition-colors line-clamp-2 mb-3">
            {product.brand_name}
          </h3>
          
          {/* Características destacadas con mejor diseño */}
          {product.features && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 mb-4">
              {Object.entries(product.features)
                .slice(0, 2)
                .map(([key, value]) => (
                  <p key={key} className="font-body text-xs text-gray-700 dark:text-gray-300 truncate">
                    <span className="font-semibold">{key}:</span> {value}
                  </p>
                ))}
            </div>
          )}
          
          {/* Estado con mejor diseño */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getConditionBadge(product.condition_state).class}`}>
              {getConditionBadge(product.condition_state).text}
            </span>
            {product.modality === 'consignación' && (
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-brand-rosa text-white shadow-sm">
                Consignación
              </span>
            )}
          </div>
          
          {/* Precios */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount ? (
                <>
                  <p className="font-heading text-2xl font-bold text-brand-rosa">
                    {formatPrice(product.online_price)}
                  </p>
                  <p className="font-body text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </p>
                </>
              ) : (
                <p className="font-heading text-2xl font-bold text-brand-azul-profundo dark:text-brand-azul">
                  {formatPrice(product.online_price)}
                </p>
              )}
            </div>
            
            {/* Botón de agregar al carrito mejorado */}
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, 1);
                
                // Emitir evento para mostrar toast
                const event = new CustomEvent('product_added_to_cart', {
                  detail: {
                    name: `${product.subcategory_name} ${product.brand_name}`,
                    image: product.images?.[0]
                  }
                });
                window.dispatchEvent(event);
                
                setShowAddedMessage(true);
                setTimeout(() => setShowAddedMessage(false), 2000);
              }}
              disabled={product.quantity === 0}
              className={`p-3 rounded-xl transition-all transform hover:scale-110 shadow-md ${
                product.quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isItemInCart(product.inventory_id)
                    ? 'bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white'
                    : 'bg-brand-azul hover:bg-brand-azul-profundo text-white'
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-verde-lima text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in-out font-semibold">
          ✓ ¡Agregado al carrito!
        </div>
      )}
    </div>
  );
};

export default ProductCard;