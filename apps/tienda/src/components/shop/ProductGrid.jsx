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
  
  // Clases para el grid responsive
  const gridClasses = `
    grid gap-4 md:gap-6
    grid-cols-${columns.mobile} 
    md:grid-cols-${columns.tablet} 
    lg:grid-cols-${columns.desktop}
  `;
  
  // Loading skeleton
  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }
  
  // Product grid
  return (
    <div className={gridClasses}>
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