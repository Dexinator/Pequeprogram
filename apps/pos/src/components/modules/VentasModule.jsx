import React, { useState } from 'react';
import NuevaVenta from '../sales/NuevaVenta';
import HistorialVentas from '../sales/HistorialVentas';

export default function VentasModule() {
  const [activeTab, setActiveTab] = useState('nueva');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('nueva')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nueva'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Nueva Venta
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historial'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial de Ventas
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'nueva' ? <NuevaVenta /> : <HistorialVentas />}
      </div>
    </div>
  );
}