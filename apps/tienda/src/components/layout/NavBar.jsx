import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Cart from '../shop/Cart';
import SearchOverlay from '../shop/SearchOverlay';
import LogoReact from './LogoReact';

const NavBarContent = () => {
  const { isAuthenticated, user, logout, isEmployee, isCustomer } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Initialize dark mode state on component mount
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
    
    setIsDarkMode(newMode);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-xl sticky top-0 z-40 transition-all border-b-4 border-brand-azul">
      <div className="relative">
        {/* Barra decorativa superior */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-azul via-brand-verde-lima to-brand-rosa"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo y navegación principal */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center group">
                  <LogoReact className="h-14 md:h-16 w-auto group-hover:scale-105 transition-transform duration-300" />
                </a>
              </div>
              
              <div className="hidden md:ml-10 md:flex md:space-x-6">
                <a href="/" className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-azul dark:hover:text-brand-azul-light font-heading font-medium rounded-lg hover:bg-brand-azul/10 transition-all">
                  <span className="mr-2">🏠</span>
                  Inicio
                </a>
                <a href="/productos" className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-verde-lima dark:hover:text-brand-verde-lima font-heading font-medium rounded-lg hover:bg-brand-verde-lima/10 transition-all">
                  <span className="mr-2">🛍️</span>
                  Productos
                </a>
                <a href="/categorias" className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-rosa dark:hover:text-brand-rosa font-heading font-medium rounded-lg hover:bg-brand-rosa/10 transition-all">
                  <span className="mr-2">📦</span>
                  Categorías
                </a>
                <a href="/ofertas" className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-amarillo dark:hover:text-brand-amarillo font-heading font-medium rounded-lg hover:bg-brand-amarillo/10 transition-all">
                  <span className="mr-2">⭐</span>
                  Ofertas
                </a>
              </div>
            </div>

            {/* Espacio flexible para centrar el logo */}
            <div className="hidden md:flex flex-1"></div>

            {/* Menú de usuario y carrito */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Search button */}
              <div className="relative group">
                <button
                  onClick={() => setShowSearchOverlay(true)}
                  type="button"
                  className="p-3 rounded-full bg-brand-verde-lima/10 hover:bg-brand-verde-lima/20 dark:bg-brand-verde-lima/20 dark:hover:bg-brand-verde-lima/30 text-brand-verde-lima dark:text-brand-verde-lima transition-all transform hover:scale-110 shadow-lg"
                  aria-label="Buscar productos"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Buscar productos
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                  </div>
                </div>
              </div>
              {/* Dark mode toggle */}
              <div className="relative group">
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="p-3 rounded-full bg-brand-azul/10 hover:bg-brand-azul/20 dark:bg-brand-azul/20 dark:hover:bg-brand-azul/30 text-brand-azul dark:text-brand-azul-light transition-all transform hover:scale-110 shadow-lg"
                  aria-label="Toggle dark mode"
                >
                {/* Sun icon (shown in dark mode) */}
                <svg 
                  className={`w-6 h-6 ${isDarkMode ? 'block' : 'hidden'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
                </svg>
                {/* Moon icon (shown in light mode) */}
                <svg 
                  className={`w-6 h-6 ${!isDarkMode ? 'block' : 'hidden'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                  </div>
                </div>
              </div>

              {/* Carrito */}
              <Cart />

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-azul dark:hover:text-brand-azul-light focus:outline-none bg-brand-azul/10 hover:bg-brand-azul/20 rounded-full transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {isAuthenticated && (
                    <span className="ml-2 text-sm font-heading font-medium hidden lg:inline">
                      {user?.first_name || user?.username}
                    </span>
                  )}
                </button>

                {/* Dropdown del menú de usuario */}
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-brand-azul/20 overflow-hidden">
                    <div className="py-1">
                      {!isAuthenticated ? (
                        <>
                          {/* Funcionalidad de login temporalmente deshabilitada
                          <a href="/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Iniciar sesión
                          </a>
                          <a href="/registro" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Registrarse
                          </a>
                          */}
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

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            🚪 Cerrar sesión
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de menú móvil */}
            <div className="flex items-center md:hidden space-x-3">
              {/* Search button - Mobile */}
              <button
                onClick={() => setShowSearchOverlay(true)}
                type="button"
                className="p-2 rounded-full bg-brand-verde-lima/10 hover:bg-brand-verde-lima/20 dark:bg-brand-verde-lima/20 dark:hover:bg-brand-verde-lima/30 text-brand-verde-lima transition-all"
                aria-label="Buscar productos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Dark mode toggle - Mobile */}
              <button
                onClick={toggleTheme}
                type="button"
                className="p-2 rounded-full bg-brand-azul/10 hover:bg-brand-azul/20 dark:bg-brand-azul/20 dark:hover:bg-brand-azul/30 text-brand-azul dark:text-brand-azul-light transition-all"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </svg>
                )}
              </button>
              
              <Cart />
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:text-brand-azul hover:bg-brand-azul/10 focus:outline-none transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Menú móvil */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <a href="/" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-azul hover:bg-brand-azul/10 font-heading font-medium transition-all">
              🏠 Inicio
            </a>
            <a href="/productos" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-verde-lima hover:bg-brand-verde-lima/10 font-heading font-medium transition-all">
              🛍️ Productos
            </a>
            <a href="/categorias" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-rosa hover:bg-brand-rosa/10 font-heading font-medium transition-all">
              📦 Categorías
            </a>
            <a href="/ofertas" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-amarillo hover:bg-brand-amarillo/10 font-heading font-medium transition-all">
              ⭐ Ofertas
            </a>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
              {!isAuthenticated ? (
                <>
                  {/* Funcionalidad de login temporalmente deshabilitada
                  <a href="/login" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-azul hover:bg-brand-azul/10 font-medium transition-all">
                    🔑 Iniciar sesión
                  </a>
                  <a href="/registro" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-verde-lima hover:bg-brand-verde-lima/10 font-medium transition-all">
                    ✨ Registrarse
                  </a>
                  */}
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-sm font-heading font-semibold text-brand-azul dark:text-brand-azul-light">
                    Hola, {user?.first_name || user?.username} 👋
                  </div>
                  
                  {isCustomer && (
                    <>
                      <a href="/mi-cuenta" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-azul hover:bg-brand-azul/10 font-medium transition-all">
                        👤 Mi cuenta
                      </a>
                      <a href="/mis-pedidos" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-verde-lima hover:bg-brand-verde-lima/10 font-medium transition-all">
                        📦 Mis pedidos
                      </a>
                    </>
                  )}
                  
                  {isEmployee && (
                    <>
                      <a href="/preparar-productos" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-rosa hover:bg-brand-rosa/10 font-medium transition-all">
                        📸 Preparar productos
                      </a>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all"
                  >
                    🚪 Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={showSearchOverlay} 
        onClose={() => setShowSearchOverlay(false)} 
      />
    </nav>
  );
};

const NavBar = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NavBarContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default NavBar;