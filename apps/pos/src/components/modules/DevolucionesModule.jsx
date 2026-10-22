import React, { useState } from 'react';
import NewReturn from '../returns/NewReturn';
import ReturnsList from '../returns/ReturnsList';

const TABS = {
  nueva: 'Nueva devolución',
  historial: 'Historial'
};

export default function DevolucionesModule() {
  const [tab, setTab] = useState('nueva');

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

      {tab === 'nueva' ? <NewReturn onDone={() => setTab('historial')} /> : <ReturnsList />}
    </div>
  );
}
