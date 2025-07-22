import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import ProductGrid from './ProductGrid';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadFeaturedProducts();
  }, []);
  
  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Por ahora, usar productos normales como destacados
      const response = await productsService.getOnlineProducts({
        limit: 8
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div>
      <ProductGrid
        products={products}
        loading={loading}
        emptyMessage="No hay productos destacados disponibles en este momento"
      />
      
      {!loading && products.length > 0 && (
        <div className="text-center mt-8">
          <a 
            href="/productos" 
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Ver todos los productos
          </a>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;