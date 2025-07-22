import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginContainer from './auth/LoginContainer';
import Cart from './shop/Cart';

// Componente de menú de usuario
const UserMenu = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isAuthenticated, logout, isEmployee } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <div className="relative group">
          <button className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden md:inline">{user?.first_name || user?.username}</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="py-2">
              <a href="/mi-cuenta" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mi cuenta</a>
              <a href="/mis-pedidos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mis pedidos</a>
              {isEmployee && (
                <>
                  <hr className="my-2" />
                  <a href="/preparar-productos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Preparar productos</a>
                  <a href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Panel admin</a>
                </>
              )}
              <hr className="my-2" />
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="text-gray-700 hover:text-pink-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}

      {/* Modal de login */}
      {showLoginModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <LoginContainer
              onSuccess={() => setShowLoginModal(false)}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Componente principal de la tienda (providers ya están en Layout)
const StoreApp = () => {
  return (
    <div className="flex items-center gap-4">
      <Cart />
      <UserMenu />
    </div>
  );
};

export default StoreApp;