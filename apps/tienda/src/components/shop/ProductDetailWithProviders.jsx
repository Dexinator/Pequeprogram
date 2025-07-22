import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import ProductDetail from './ProductDetail';

const ProductDetailWithProviders = ({ productId }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductDetail productId={productId} />
      </CartProvider>
    </AuthProvider>
  );
};

export default ProductDetailWithProviders;