import React, { useState } from 'react';
import OnlineSalesList from '../onlineSales/OnlineSalesList';
import OnlineSalesStats from '../onlineSales/OnlineSalesStats';

export default function OnlineSalesModule() {
  const [activeTab, setActiveTab] = useState('lista');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('lista')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lista'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📦 Pedidos Online
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'estadisticas'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Estadísticas
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'lista' ? <OnlineSalesList /> : <OnlineSalesStats />}
      </div>
    </div>
  );
}
