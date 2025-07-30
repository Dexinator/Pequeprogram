import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  emptyMessage = "No se encontraron productos",
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4
  }
}) => {
  
  // Clases para el grid responsive - usando clases completas para Tailwind
  const getGridClasses = () => {
    const mobileClass = columns.mobile === 1 ? 'grid-cols-1' : 'grid-cols-2';
    const tabletClass = columns.tablet === 2 ? 'md:grid-cols-2' : columns.tablet === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';
    const desktopClass = columns.desktop === 3 ? 'lg:grid-cols-3' : columns.desktop === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5';
    
    return `grid gap-6 md:gap-8 ${mobileClass} ${tabletClass} ${desktopClass}`;
  };
  
  // Loading skeleton
  if (loading) {
    return (
      <div className={getGridClasses()}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-azul/10 dark:bg-brand-azul/20 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-brand-azul"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="font-heading text-lg text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  // Product grid
  return (
    <div className={getGridClasses()}>
      {products.map((product) => (
        <ProductCard
          key={product.inventory_id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;