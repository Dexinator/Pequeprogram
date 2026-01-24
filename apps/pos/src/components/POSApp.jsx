import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VentasModule from './modules/VentasModule';
import InventarioModule from './modules/InventarioModule';
import ComprasModule from './modules/ComprasModule';
import ConsignacionesModule from './modules/ConsignacionesModule';
import OnlineSalesModule from './modules/OnlineSalesModule';
import ProductosModule from './modules/ProductosModule';

export default function POSApp() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('ventas');

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'ventas':
        return <VentasModule />;
      case 'inventario':
        return <InventarioModule />;
      case 'compras':
        return <ComprasModule />;
      case 'consignaciones':
        return <ConsignacionesModule />;
      case 'ventas-online':
        return <OnlineSalesModule />;
      case 'productos':
        return <ProductosModule />;
      default:
        return <VentasModule />;
    }
  };

  const moduleIcons = {
    ventas: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    inventario: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    compras: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    consignaciones: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    'ventas-online': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.5" />
      </svg>
    ),
    productos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-pink-500">Entrepeques POS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
                {Object.entries({
                  ventas: 'Ventas',
                  'ventas-online': 'Ventas Online',
                  inventario: 'Inventario',
                  compras: 'Compras',
                  consignaciones: 'Consignaciones',
                  productos: 'Productos'
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveModule(key)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeModule === key
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{moduleIcons[key]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                <span className="text-gray-500 ml-2">({user?.role?.name || user?.role || 'Sin rol'})</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="grid grid-cols-3 gap-1 p-2">
            {Object.entries({
              ventas: 'Ventas',
              'ventas-online': 'Online',
              inventario: 'Inventario',
              compras: 'Compras',
              consignaciones: 'Consig.',
              productos: 'Productos'
            }).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveModule(key)}
                className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeModule === key
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{moduleIcons[key]}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {renderModule()}
      </main>
    </div>
  );
}