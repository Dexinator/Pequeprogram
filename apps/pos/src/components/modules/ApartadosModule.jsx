import React, { useState } from 'react';
import NewLayaway from '../layaways/NewLayaway';
import LayawaysList from '../layaways/LayawaysList';

const TABS = {
  nuevo: 'Nuevo apartado',
  listado: 'Apartados'
};

export default function ApartadosModule() {
  const [tab, setTab] = useState('listado');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

      {tab === 'nuevo' ? <NewLayaway onDone={() => setTab('listado')} /> : <LayawaysList />}
    </div>
  );
}
