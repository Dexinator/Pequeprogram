import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function ApiTest() {
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiMessage, setApiMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkApiConnection() {
      try {
        setApiStatus('loading');
        // Intenta conectar con la ruta raíz de la API
        const response = await api.get('');
        setApiStatus('connected');
        setApiMessage(response?.message || 'Conexión exitosa');
      } catch (err) {
        console.error('Error conectando con la API:', err);
        setApiStatus('error');
        setError(err.message || 'Error desconocido al conectar con la API');
      }
    }

    checkApiConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Estado de la API</h2>
      
      {apiStatus === 'loading' && (
        <p className="text-amber-500">Conectando con la API...</p>
      )}
      
      {apiStatus === 'connected' && (
        <div>
          <p className="text-green-600">✅ API conectada correctamente</p>
          {apiMessage && <p className="mt-2 text-sm">{apiMessage}</p>}
          <p className="mt-2 text-xs text-slate-500">
            URL de la API: {import.meta.env.PUBLIC_API_URL || 'No configurada'}
          </p>
        </div>
      )}
      
      {apiStatus === 'error' && (
        <div>
          <p className="text-red-600">❌ Error al conectar con la API</p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <p className="mt-2 text-xs text-slate-500">
            URL de la API: {import.meta.env.PUBLIC_API_URL || 'No configurada'}
          </p>
        </div>
      )}
    </div>
  );
} 