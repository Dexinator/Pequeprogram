import React, { useState } from 'react';
import NuevaVenta from './NuevaVenta';
import HistorialVentas from './HistorialVentas';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

const VentasMain = () => {
  const [activeTab, setActiveTab] = useState('historial'); // 'historial' o 'nueva'
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
            <p className="mt-1 text-gray-600">Gestión de ventas de la tienda física</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-600">
              Usuario: <span className="font-medium">{user?.first_name} {user?.last_name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Ubicación: <span className="font-medium">Polanco</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Historial de Ventas
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('nueva')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'nueva'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nueva Venta
              </div>
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'historial' && <HistorialVentas />}
          {activeTab === 'nueva' && <NuevaVenta />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Acción Rápida</p>
              <button
                onClick={() => setActiveTab('nueva')}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gestión</p>
              <a
                href="/inventario"
                className="text-lg font-semibold text-green-600 hover:text-green-800"
              >
                Ver Inventario
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reportes</p>
              <button
                onClick={() => setActiveTab('historial')}
                className="text-lg font-semibold text-purple-600 hover:text-purple-800"
              >
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VentasApp = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <VentasMain />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default VentasApp;