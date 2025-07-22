import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import AllProducts from './AllProducts';

const AllProductsWithProviders = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AllProducts />
      </CartProvider>
    </AuthProvider>
  );
};

export default AllProductsWithProviders;