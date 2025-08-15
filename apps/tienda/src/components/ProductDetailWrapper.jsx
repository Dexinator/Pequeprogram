import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import ProductDetailRedesigned from './shop/ProductDetailRedesigned';

const ProductDetailWrapper = (props) => {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductDetailRedesigned {...props} />
      </CartProvider>
    </AuthProvider>
  );
};

export default ProductDetailWrapper;