import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de barra de navegación con opciones según el estado de autenticación
 */
export default function NavBar() {
  // Obtener funciones y estado del contexto de autenticación
  // Usamos try/catch para manejar el caso cuando se usa fuera de un AuthProvider
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Error al usar useAuth en NavBar:', error);
    // Valores por defecto si no se puede acceder al contexto
    authContext = {
      user: null,
      isAuthenticated: false,
      logout: () => {}
    };
  }

  const { user, isAuthenticated, logout } = authContext;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Verificar el tema actual al cargar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Aplicar tema según preferencia guardada o del sistema
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Alternar menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Alternar menú de usuario
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Alternar tema oscuro/claro
  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="bg-azul-claro text-white py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-heading font-bold">
              Entrepeques Valuador
            </a>
          </div>

          {/* Menú de navegación para pantallas medianas y grandes */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <a
                  href="/"
                  className="hover:text-white/80 transition-colors"
                >
                  Inicio
                </a>
                <a
                  href="/nueva-valuacion"
                  className="hover:text-white/80 transition-colors"
                >
                  Nueva Valuación
                </a>
                <a
                  href="/historial"
                  className="hover:text-white/80 transition-colors"
                >
                  Historial
                </a>
                <a
                  href="/ventas"
                  className="hover:text-white/80 transition-colors"
                >
                  Ventas
                </a>
                <a
                  href="/consignaciones"
                  className="hover:text-white/80 transition-colors"
                >
                  Consignaciones
                </a>

                {/* Botón de cambio de tema */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Cambiar tema"
                >
                  {isDarkMode ? (
                    <span>☀️</span>
                  ) : (
                    <span>🌙</span>
                  )}
                </button>

                {/* Menú de usuario */}
                <div className="relative ml-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:text-white/80 transition-colors"
                    onClick={toggleUserMenu}
                  >
                    <span>{user?.name || user?.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Menú desplegable */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <a
                        href="/perfil"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mi Perfil
                      </a>
                      {user?.role === 'admin' && (
                        <a
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Administración
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a
                href="/login"
                className="hover:text-white/80 transition-colors"
              >
                Iniciar Sesión
              </a>
            )}
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-white/80 focus:outline-none"
              onClick={toggleMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <a
                  href="/"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Inicio
                </a>
                <a
                  href="/nueva-valuacion"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Nueva Valuación
                </a>
                <a
                  href="/historial"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Historial
                </a>
                <a
                  href="/ventas"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Ventas
                </a>
                <a
                  href="/consignaciones"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Consignaciones
                </a>
                {user?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                  >
                    Administración
                  </a>
                )}
                <a
                  href="/perfil"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Mi Perfil
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Cerrar Sesión
                </button>

                {/* Botón de cambio de tema en móvil */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full text-left hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  <span className="mr-2">
                    {isDarkMode ? '☀️' : '🌙'}
                  </span>
                  <span>
                    {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="block hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  Iniciar Sesión
                </a>

                {/* Botón de cambio de tema en móvil */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full text-left hover:bg-azul-profundo px-3 py-2 rounded-md"
                >
                  <span className="mr-2">
                    {isDarkMode ? '☀️' : '🌙'}
                  </span>
                  <span>
                    {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
