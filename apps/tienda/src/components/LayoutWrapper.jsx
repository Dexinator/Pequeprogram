import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import NavBar from './layout/NavBar';

const LayoutWrapper = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <NavBar />
        <main className="min-h-screen">
          {children}
        </main>
      </CartProvider>
    </AuthProvider>
  );
};

export default LayoutWrapper;