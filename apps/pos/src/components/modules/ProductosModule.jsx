import React from 'react';
import ProductsList from '../products/ProductsList';

export default function ProductosModule() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Administrar Productos</h2>
        <p className="text-gray-600 mt-1">
          Gestiona los productos del inventario y edita las notas que se mostraran en la tienda en linea
        </p>
      </div>

      {/* Products List */}
      <ProductsList />
    </div>
  );
}
