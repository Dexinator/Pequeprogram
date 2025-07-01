import React, { useState } from 'react';
import NewPurchase from './purchases/NewPurchase';
import PurchasesList from './purchases/PurchasesList';

export default function PurchasesApp() {
  const [activeView, setActiveView] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePurchaseCreated = () => {
    setActiveView('list');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Compras de Otros Productos</h2>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'list'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver Compras
          </button>
          
          <button
            onClick={() => setActiveView('new')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'new'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Compra
          </button>
        </div>
      </div>

      {activeView === 'list' && (
        <PurchasesList refreshTrigger={refreshTrigger} />
      )}

      {activeView === 'new' && (
        <NewPurchase 
          onSuccess={handlePurchaseCreated}
          onCancel={() => setActiveView('list')}
        />
      )}
    </div>
  );
}