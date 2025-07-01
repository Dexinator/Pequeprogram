import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';

export default function AdminApp() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('users');

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'reports':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes del Negocio</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">Sección de reportes en desarrollo...</p>
            </div>
          </div>
        );
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-pink-500">Entrepeques Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveSection('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeSection === 'users'
                      ? 'border-pink-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Usuarios
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeSection === 'reports'
                      ? 'border-pink-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Reportes
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {renderSection()}
      </main>
    </div>
  );
}