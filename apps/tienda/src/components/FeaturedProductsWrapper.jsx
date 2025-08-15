import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import FeaturedProducts from './shop/FeaturedProducts';

const FeaturedProductsWrapper = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <FeaturedProducts />
      </CartProvider>
    </AuthProvider>
  );
};

export default FeaturedProductsWrapper;