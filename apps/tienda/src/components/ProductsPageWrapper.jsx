import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import AllProducts from './shop/AllProducts';

const ProductsPageWrapper = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AllProducts />
      </CartProvider>
    </AuthProvider>
  );
};

export default ProductsPageWrapper;