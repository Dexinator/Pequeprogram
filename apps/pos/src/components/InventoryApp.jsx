import React, { useState } from 'react';
import InventoryList from './inventory/InventoryList';
import SkuCatalog from './inventory/SkuCatalog';

const TABS = {
  inventario: 'Inventario',
  claves: 'Claves de producto'
};

export default function InventoryApp() {
  const [tab, setTab] = useState('inventario');

  return (
    <div className="space-y-6">
      {/* El catálogo de claves es material de consulta del inventario, por eso
          vive como pestaña aquí y no como módulo propio en la barra. */}
      <div className="flex space-x-1 border-b border-gray-200">
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'inventario' ? <InventoryList /> : <SkuCatalog />}
    </div>
  );
}
