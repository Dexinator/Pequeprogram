import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import CartPage from './shop/CartPage.jsx';

/**
 * Cada isla de Astro es un root de React independiente, así que el CartProvider
 * que vive en el header no alcanza a la página del carrito. Sin este wrapper,
 * CartPage se montaba sin contexto y /carrito se veía vacío en escritorio
 * (en móvil funcionaba porque el drawer vive dentro de la isla del NavBar).
 */
const CartPageWrapper = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <CartPage />
      </CartProvider>
    </AuthProvider>
  );
};

export default CartPageWrapper;
