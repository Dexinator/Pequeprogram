import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import { useCart } from '../../context/CartContext';
import ImageGallery from './ImageGallery';
import ProductCard from './ProductCard';

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addItem, isItemInCart, getItemQuantity } = useCart();
  
  useEffect(() => {
    loadProduct();
  }, [productId]);
  
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar producto
      const productData = await productsService.getProductDetail(productId);
      setProduct(productData);
      
      // Cargar productos relacionados
      if (productData.id) {
        try {
          const related = await productsService.getRelatedProducts(productData.id);
          setRelatedProducts(related);
        } catch {
          // Si falla, no es crítico
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
      'excelente': { text: 'Excelente', class: 'bg-green-100 text-green-800' },
      'bueno': { text: 'Bueno', class: 'bg-blue-100 text-blue-800' },
      'regular': { text: 'Regular', class: 'bg-yellow-100 text-yellow-800' }
    };
    return conditions[condition] || conditions['regular'];
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error || 'Producto no encontrado'}</p>
            <a href="/productos" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
              ← Volver a productos
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Calcular descuento si existe
  const hasDiscount = product.discount_percentage > 0;
  const originalPrice = hasDiscount 
    ? product.online_price / (1 - product.discount_percentage / 100)
    : product.online_price;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Inicio</a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li>
                <a href="/productos" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Productos</a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li>
                <a href={`/categoria/${product.category_name.toLowerCase()}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  {product.category_name}
                </a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">/</li>
              <li className="text-gray-900 dark:text-gray-100 font-medium truncate">
                {product.brand_name}
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <div>
            <ImageGallery 
              images={product.images} 
              productName={`${product.subcategory_name} ${product.brand_name}`} 
            />
          </div>
          
          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y categoría */}
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {product.category_name} • {product.subcategory_name}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {product.brand_name}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${getConditionBadge(product.condition_state).class}`}>
                  Estado: {getConditionBadge(product.condition_state).text}
                </span>
                {product.quantity === 1 && (
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-pink-100 text-pink-800">
                    Pieza única
                  </span>
                )}
              </div>
            </div>
            
            {/* Precio */}
            <div className="border-t border-b py-4">
              {hasDiscount ? (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-pink-600">
                      {formatPrice(product.online_price)}
                    </span>
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                      -{product.discount_percentage}%
                    </span>
                  </div>
                  {product.discount_valid_until && (
                    <p className="text-sm text-red-600 mt-2">
                      Oferta válida hasta: {new Date(product.discount_valid_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(product.online_price)}
                </span>
              )}
            </div>
            
            {/* Stock y cantidad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Disponibilidad:</span>
                <span className={`font-medium ${product.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.quantity > 0 ? `${product.quantity} disponible(s)` : 'Agotado'}
                </span>
              </div>
              
              {product.quantity > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Cantidad:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border border-gray-300 rounded-lg px-2 py-2"
                      min="1"
                      max={product.quantity}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Ubicación: {product.location}</span>
              </div>
            </div>
            
            {/* Botón de compra */}
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                product.quantity > 0
                  ? isItemInCart(product.inventory_id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.quantity > 0 
                ? isItemInCart(product.inventory_id)
                  ? `En el carrito (${getItemQuantity(product.inventory_id)})`
                  : 'Agregar al carrito'
                : 'Producto agotado'}
            </button>
            
            {/* Mensaje de confirmación */}
            {showAddedMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">¡Producto agregado al carrito!</span>
              </div>
            )}
            
            {/* Información adicional */}
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Producto original y verificado
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Compra segura y protegida
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Envío a todo México
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs de información */}
        <div className="bg-white rounded-lg shadow-sm mb-12">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Descripción
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'features'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Características
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Envío
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Acerca de este producto</h3>
                <p className="text-gray-600 mb-4">
                  {product.subcategory_name} de la marca {product.brand_name} en estado {getConditionBadge(product.condition_state).text.toLowerCase()}.
                  Este producto ha sido cuidadosamente revisado y verificado por nuestro equipo de especialistas.
                </p>
                {product.special_offer_text && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Oferta especial:</strong> {product.special_offer_text}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'features' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Características del producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Categoría</span>
                      <span className="font-medium">{product.category_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Subcategoría</span>
                      <span className="font-medium">{product.subcategory_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Marca</span>
                      <span className="font-medium">{product.brand_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Condición</span>
                      <span className="font-medium">{getConditionBadge(product.condition_state).text}</span>
                    </div>
                  </div>
                  {product.features && Object.keys(product.features).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(product.features).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Información de envío</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Envío gratis</strong> en compras mayores a $895<br>*aplican restricciones</br>
                  </p>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Envíos a todo México a través de paqueterías confiables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Tiempo de entrega: 3-7 días hábiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Empaque seguro para proteger tu compra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Número de rastreo incluido</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos relacionados
            </h2>
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

export default ProductDetail;