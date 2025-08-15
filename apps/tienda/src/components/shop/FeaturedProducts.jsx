import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import ProductGrid from './ProductGrid';
import ErrorBoundary from '../ErrorBoundary';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadFeaturedProducts();
  }, []);
  
  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Cargar productos marcados como destacados
      const products = await productsService.getFeaturedProducts(8);
      setProducts(products);
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <ErrorBoundary>
      <div>
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No hay productos destacados disponibles en este momento"
        />
        
        {!loading && products.length > 0 && (
          <div className="text-center mt-12">
            <a 
              href="/productos" 
              className="inline-block bg-brand-azul hover:bg-brand-azul-profundo text-white px-8 py-4 rounded-xl font-heading font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Ver todos los productos
            </a>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FeaturedProducts;