import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, user, logout, isEmployee, isCustomer } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-pink-600">
                Entrepeques
              </a>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="/" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-pink-600">
                Inicio
              </a>
              <a href="/productos" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-pink-600">
                Productos
              </a>
              <a href="/categorias" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-pink-600">
                Categorías
              </a>
              <a href="/nosotros" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-pink-600">
                Nosotros
              </a>
            </div>
          </div>

          {/* Menú de usuario */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Carrito */}
            <a href="/carrito" className="p-2 text-gray-700 hover:text-pink-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </a>

            {/* Menú de usuario */}
            <div className="ml-3 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-gray-700 hover:text-pink-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isAuthenticated && (
                  <span className="ml-2 text-sm font-medium">
                    {user?.first_name || user?.username}
                  </span>
                )}
              </button>

              {/* Dropdown del menú de usuario */}
              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {!isAuthenticated ? (
                      <>
                        <a href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Iniciar sesión
                        </a>
                        <a href="/registro" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Registrarse
                        </a>
                      </>
                    ) : (
                      <>
                        {/* Menú para clientes */}
                        {isCustomer && (
                          <>
                            <a href="/mi-cuenta" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Mi cuenta
                            </a>
                            <a href="/mis-pedidos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Mis pedidos
                            </a>
                            <a href="/mis-favoritos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Favoritos
                            </a>
                          </>
                        )}

                        {/* Menú para empleados */}
                        {isEmployee && (
                          <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div className="px-4 py-2 text-xs text-gray-500">Empleado</div>
                            <a href="/preparar-productos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Preparar productos
                            </a>
                            <a href="/reportes-tienda" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Reportes
                            </a>
                            
                            {/* Enlaces a otras apps para empleados */}
                            <div className="border-t border-gray-100 my-1"></div>
                            <div className="px-4 py-2 text-xs text-gray-500">Otras aplicaciones</div>
                            <a href="http://localhost:4324" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              POS
                            </a>
                            <a href="http://localhost:4321" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Valuador
                            </a>
                            {(user?.role?.name === 'admin' || user?.role?.name === 'superadmin' || user?.role?.name === 'manager' || user?.role?.name === 'gerente') && (
                              <a href="http://localhost:4322" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Admin
                              </a>
                            )}
                          </>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {showMobileMenu && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a href="/" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
              Inicio
            </a>
            <a href="/productos" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
              Productos
            </a>
            <a href="/categorias" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
              Categorías
            </a>
            <a href="/carrito" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
              Carrito
            </a>
            
            <div className="border-t border-gray-200 mt-3 pt-3">
              {!isAuthenticated ? (
                <>
                  <a href="/login" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                    Iniciar sesión
                  </a>
                  <a href="/registro" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                    Registrarse
                  </a>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Hola, {user?.first_name || user?.username}
                  </div>
                  
                  {isCustomer && (
                    <>
                      <a href="/mi-cuenta" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                        Mi cuenta
                      </a>
                      <a href="/mis-pedidos" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                        Mis pedidos
                      </a>
                    </>
                  )}
                  
                  {isEmployee && (
                    <>
                      <a href="/preparar-productos" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                        Preparar productos
                      </a>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Componente wrapper con AuthProvider
const NavBarWithAuth = () => {
  return (
    <AuthProvider>
      <NavBar />
    </AuthProvider>
  );
};

export default NavBarWithAuth;