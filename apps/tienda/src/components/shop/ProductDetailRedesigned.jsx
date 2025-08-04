import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import { CartProvider, useCart } from '../../context/CartContext';
import ImageGalleryRedesigned from './ImageGalleryRedesigned';
import ProductCard from './ProductCard';

const ProductDetailContent = ({ productId, initialProduct, initialRelatedProducts, initialError }) => {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(initialError);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts || []);
  const [activeTab, setActiveTab] = useState('description');
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addItem, isItemInCart, getItemQuantity } = useCart();
  
  useEffect(() => {
    if (!initialProduct) {
      loadProduct();
    }
  }, [productId, initialProduct]);
  
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productsService.getProductDetail(productId);
      setProduct(productData);
      
      if (productData.inventory_id) {
        try {
          const related = await productsService.getRelatedProducts(productData.inventory_id);
          setRelatedProducts(related);
        } catch {
          setRelatedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
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
  
  const handleAddToCart = () => {
    addItem(product, quantity);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };
  
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, product.quantity));
    setQuantity(newQuantity);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-rosa/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-brand-rosa" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-brand-rosa font-heading text-lg mb-4">{error || 'Producto no encontrado'}</p>
            <a href="/productos" className="inline-flex items-center gap-2 text-brand-azul hover:text-brand-azul-profundo font-semibold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a productos
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  const hasDiscount = product.discount_percentage > 0;
  const originalPrice = hasDiscount 
    ? product.online_price / (1 - product.discount_percentage / 100)
    : product.online_price;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Breadcrumb mejorado */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 dark:text-gray-400 hover:text-brand-azul dark:hover:text-brand-azul transition-colors">
                  Inicio
                </a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li>
                <a href="/productos" className="text-gray-500 dark:text-gray-400 hover:text-brand-azul dark:hover:text-brand-azul transition-colors">
                  Productos
                </a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li>
                <a href={`/categoria/${product.category_name.toLowerCase()}`} className="text-gray-500 dark:text-gray-400 hover:text-brand-azul dark:hover:text-brand-azul transition-colors">
                  {product.category_name}
                </a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li className="text-brand-azul font-medium truncate">
                {product.brand_name}
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      {/* Contenido principal con diseño Entrepeques */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes rediseñada */}
          <div>
            <ImageGalleryRedesigned 
              images={product.images} 
              productName={`${product.subcategory_name} ${product.brand_name}`} 
              hasDiscount={hasDiscount}
              discountPercentage={product.discount_percentage}
            />
          </div>
          
          {/* Información del producto con estilo Entrepeques */}
          <div className="space-y-6">
            {/* Título y categoría */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-body text-brand-verde-lima dark:text-brand-verde-lima">
                  {product.category_name}
                </span>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span className="text-sm font-body text-brand-verde-lima dark:text-brand-verde-lima">
                  {product.subcategory_name}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-brand-rosa mb-4">
                {product.brand_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getConditionBadge(product.condition_state).class} shadow-md`}>
                  Estado: {getConditionBadge(product.condition_state).text}
                </span>
                {product.quantity === 1 && (
                  <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-brand-rosa text-white shadow-md">
                    🌟 Pieza única
                  </span>
                )}
                {product.modality === 'consignación' && (
                  <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-brand-amarillo text-gray-900 shadow-md">
                    📦 Consignación
                  </span>
                )}
              </div>
            </div>
            
            {/* Precio con estilo Entrepeques */}
            <div className="bg-gradient-to-br from-brand-azul/10 to-brand-verde-lima/10 dark:from-brand-azul/5 dark:to-brand-verde-lima/5 rounded-2xl p-6">
              {hasDiscount ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-display text-4xl text-brand-azul">
                      {formatPrice(product.online_price)}
                    </span>
                    <span className="font-heading text-2xl text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="bg-brand-rosa text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      -{product.discount_percentage}%
                    </span>
                  </div>
                  {product.discount_valid_until && (
                    <p className="text-sm text-brand-rosa font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Oferta válida hasta: {new Date(product.discount_valid_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <span className="font-display text-4xl text-brand-azul">
                  {formatPrice(product.online_price)}
                </span>
              )}
            </div>
            
            {/* Stock y cantidad con diseño mejorado */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-gray-700 dark:text-gray-300">Disponibilidad:</span>
                <span className={`font-heading font-semibold ${product.quantity > 0 ? 'text-brand-verde-lima' : 'text-brand-rosa'}`}>
                  {product.quantity > 0 ? `${product.quantity} disponible(s)` : 'Agotado'}
                </span>
              </div>
              
              {product.quantity > 1 && (
                <div className="flex items-center justify-between">
                  <span className="font-heading text-gray-700 dark:text-gray-300">Cantidad:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 rounded-lg bg-brand-azul/10 hover:bg-brand-azul/20 text-brand-azul font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-2 border-brand-azul/30 rounded-lg px-2 py-2 font-heading focus:ring-2 focus:ring-brand-azul focus:border-transparent"
                      min="1"
                      max={product.quantity}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-brand-azul/10 hover:bg-brand-azul/20 text-brand-azul font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-brand-verde-lima" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-body">Ubicación: <span className="font-semibold">{product.location}</span></span>
              </div>
            </div>
            
            {/* Botón de compra con estilo Entrepeques */}
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className={`w-full py-4 px-6 rounded-xl font-heading font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                product.quantity > 0
                  ? isItemInCart(product.inventory_id)
                    ? 'bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white'
                    : 'bg-brand-azul hover:bg-brand-azul-profundo text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {product.quantity > 0 
                ? isItemInCart(product.inventory_id)
                  ? `✓ En el carrito (${getItemQuantity(product.inventory_id)})`
                  : '🛒 Agregar al carrito'
                : '😔 Producto agotado'}
            </button>
            
            {/* Mensaje de confirmación mejorado */}
            {showAddedMessage && (
              <div className="bg-brand-verde-lima/20 border-2 border-brand-verde-lima text-brand-verde-oscuro px-4 py-3 rounded-xl font-heading font-semibold animate-pulse">
                <span className="block text-center">✓ ¡Producto agregado al carrito!</span>
              </div>
            )}
            
            {/* Información adicional con iconos Entrepeques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-sm font-body text-gray-700 dark:text-gray-300">
                  Producto verificado
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">🛡️</div>
                <p className="text-sm font-body text-gray-700 dark:text-gray-300">
                  Compra protegida
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">🚚</div>
                <p className="text-sm font-body text-gray-700 dark:text-gray-300">
                  Envío a todo México
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs de información con estilo Entrepeques */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl mb-12 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-3 px-4 rounded-lg font-heading font-semibold transition-all ${
                  activeTab === 'description'
                    ? 'bg-white dark:bg-gray-700 text-brand-azul shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📝 Descripción
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`flex-1 py-3 px-4 rounded-lg font-heading font-semibold transition-all ${
                  activeTab === 'features'
                    ? 'bg-white dark:bg-gray-700 text-brand-azul shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                ⭐ Características
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`flex-1 py-3 px-4 rounded-lg font-heading font-semibold transition-all ${
                  activeTab === 'shipping'
                    ? 'bg-white dark:bg-gray-700 text-brand-azul shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                🚚 Envío
              </button>
            </div>
          </div>
          
          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="font-heading text-2xl font-bold text-brand-azul mb-4">
                  Acerca de este producto
                </h3>
                <p className="font-body text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {product.subcategory_name} de la marca {product.brand_name} en estado {getConditionBadge(product.condition_state).text.toLowerCase()}.
                  Este producto ha sido cuidadosamente revisado y verificado por nuestro equipo de especialistas para garantizar su calidad.
                </p>
                {product.special_offer_text && (
                  <div className="bg-brand-amarillo/20 border-2 border-brand-amarillo p-4 rounded-xl">
                    <p className="text-gray-900 font-heading">
                      <strong>🎉 Oferta especial:</strong> {product.special_offer_text}
                    </p>
                  </div>
                )}
                <div className="mt-6 p-4 bg-brand-verde-lima/10 rounded-xl">
                  <p className="text-brand-verde-oscuro font-body">
                    <strong>♻️ Impacto ecológico:</strong> Al comprar este producto de segunda mano, 
                    estás contribuyendo a reducir el impacto ambiental y promoviendo la economía circular.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'features' && (
              <div>
                <h3 className="font-heading text-2xl font-bold text-brand-azul mb-4">
                  Características del producto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-body text-gray-600 dark:text-gray-400">Categoría</span>
                      <span className="font-heading font-semibold text-gray-900 dark:text-gray-100">{product.category_name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-body text-gray-600 dark:text-gray-400">Subcategoría</span>
                      <span className="font-heading font-semibold text-gray-900 dark:text-gray-100">{product.subcategory_name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-body text-gray-600 dark:text-gray-400">Marca</span>
                      <span className="font-heading font-semibold text-gray-900 dark:text-gray-100">{product.brand_name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-body text-gray-600 dark:text-gray-400">Condición</span>
                      <span className="font-heading font-semibold text-gray-900 dark:text-gray-100">{getConditionBadge(product.condition_state).text}</span>
                    </div>
                  </div>
                  {product.features && Object.keys(product.features).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(product.features).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="font-body text-gray-600 dark:text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-heading font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="font-heading text-2xl font-bold text-brand-azul mb-4">
                  Información de envío
                </h3>
                <div className="bg-gradient-to-r from-brand-azul/10 to-brand-verde-lima/10 p-6 rounded-xl">
                  <p className="font-heading text-brand-azul-profundo text-lg">
                    <strong>🎁 Envío gratis</strong> en compras mayores a $599
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📦</div>
                      <div>
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Paqueterías confiables</h4>
                        <p className="text-sm font-body text-gray-600 dark:text-gray-400">Enviamos con las mejores empresas de mensajería</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⏱️</div>
                      <div>
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Entrega rápida</h4>
                        <p className="text-sm font-body text-gray-600 dark:text-gray-400">3-7 días hábiles a todo México</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🛡️</div>
                      <div>
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Empaque seguro</h4>
                        <p className="text-sm font-body text-gray-600 dark:text-gray-400">Protegemos tu compra con materiales de calidad</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📍</div>
                      <div>
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">Rastreo incluido</h4>
                        <p className="text-sm font-body text-gray-600 dark:text-gray-400">Sigue tu pedido en tiempo real</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Productos relacionados con estilo Entrepeques */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl text-brand-rosa">
                También te puede interesar
              </h2>
              <a href="/productos" className="font-heading text-brand-azul hover:text-brand-azul-profundo font-semibold transition-colors">
                Ver más →
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.inventory_id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente wrapper que provee el contexto del carrito
const ProductDetailRedesigned = (props) => {
  // Verificar si estamos en el navegador antes de usar CartProvider
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    // Mostrar un estado de carga mientras se monta el componente
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <CartProvider>
      <ProductDetailContent {...props} />
    </CartProvider>
  );
};

export default ProductDetailRedesigned;