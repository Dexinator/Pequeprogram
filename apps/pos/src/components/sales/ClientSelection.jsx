import React, { useState, useEffect } from 'react';
import { ClientService } from '../../services/client.service';

const clientService = new ClientService();

export default function ClientSelection({ client, setClient }) {
  const [clientType, setClientType] = useState('ocasional');
  const [occasionalClientName, setOccasionalClientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    email: '',
    identification: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);
  const [error, setError] = useState('');

  // Búsqueda de clientes con debounce
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const delayDebounceFn = setTimeout(() => {
        searchClients();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchClients = async () => {
    setSearching(true);
    try {
      const results = await clientService.searchClients(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      setError('Error al buscar clientes');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectClient = (selectedClient) => {
    setClient(selectedClient);
    setSearchQuery(selectedClient.name);
    setSearchResults([]);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingClient(true);

    try {
      // Validaciones
      if (!newClientData.name.trim()) {
        throw new Error('El nombre es requerido');
      }

      const createdClient = await clientService.createClient({
        name: newClientData.name.trim(),
        phone: newClientData.phone.trim() || undefined,
        email: newClientData.email.trim() || undefined,
        identification: newClientData.identification.trim() || undefined
      });

      if (createdClient) {
        setClient(createdClient);
        setClientType('registrado');
        setSearchQuery(createdClient.name);
        setShowNewClientForm(false);
        setNewClientData({ name: '', phone: '', email: '', identification: '' });
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setError(error.message || 'Error al crear el cliente');
    } finally {
      setCreatingClient(false);
    }
  };

  const handleClientTypeChange = (type) => {
    setClientType(type);
    if (type === 'ocasional') {
      setClient(null);
      setSearchQuery('');
      setSearchResults([]);
      setShowNewClientForm(false);
    } else {
      setOccasionalClientName('');
    }
  };

  // Actualizar cliente ocasional cuando cambia el nombre
  useEffect(() => {
    if (clientType === 'ocasional' && occasionalClientName.trim()) {
      setClient({ name: occasionalClientName.trim() });
    } else if (clientType === 'ocasional' && !occasionalClientName.trim()) {
      setClient(null);
    }
  }, [occasionalClientName, clientType, setClient]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Información del Cliente</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Tipo de Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Cliente
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleClientTypeChange('ocasional')}
            className={`p-4 border rounded-lg text-center transition-colors ${
              clientType === 'ocasional'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">Cliente Ocasional</div>
            <div className="text-sm text-gray-600 mt-1">Sin registro</div>
          </button>
          <button
            onClick={() => handleClientTypeChange('registrado')}
            className={`p-4 border rounded-lg text-center transition-colors ${
              clientType === 'registrado'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">Cliente Registrado</div>
            <div className="text-sm text-gray-600 mt-1">Con datos guardados</div>
          </button>
        </div>
      </div>

      {/* Campo para Cliente Ocasional */}
      {clientType === 'ocasional' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Cliente (Opcional)
          </label>
          <input
            type="text"
            value={occasionalClientName}
            onChange={(e) => setOccasionalClientName(e.target.value)}
            placeholder="Escriba el nombre del cliente..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Si no proporciona un nombre, se registrará como "Cliente Ocasional"
          </p>
        </div>
      )}

      {/* Búsqueda/Registro de Cliente */}
      {clientType === 'registrado' && (
        <div>
          {!showNewClientForm ? (
            <>
              {/* Búsqueda de Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o teléfono..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {searching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectClient(result)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{result.name}</div>
                        <div className="flex justify-between text-sm">
                          {result.phone && (
                            <span className="text-gray-600">Tel: {result.phone}</span>
                          )}
                          {result.store_credit > 0 && (
                            <span className="text-green-600 font-medium">
                              Crédito: ${parseFloat(result.store_credit).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cliente seleccionado */}
              {client && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-green-800">Cliente seleccionado</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="font-medium">{client.name}</p>
                    {client.phone && <p className="text-gray-600">Tel: {client.phone}</p>}
                    {client.email && <p className="text-gray-600">Email: {client.email}</p>}
                    {client.store_credit > 0 && (
                      <p className="text-green-600 font-medium mt-1">
                        Crédito disponible: ${parseFloat(client.store_credit).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Botón para nuevo cliente */}
              <div className="mt-4">
                <button
                  onClick={() => setShowNewClientForm(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Registrar Nuevo Cliente
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Formulario de Nuevo Cliente */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-700">Registrar Nuevo Cliente</h4>
                  <button
                    onClick={() => {
                      setShowNewClientForm(false);
                      setNewClientData({ name: '', phone: '', email: '', identification: '' });
                      setError('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="10 dígitos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación (INE/Pasaporte)
                    </label>
                    <input
                      type="text"
                      value={newClientData.identification}
                      onChange={(e) => setNewClientData({ ...newClientData, identification: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingClient || !newClientData.name.trim()}
                    className="w-full py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {creatingClient ? 'Registrando...' : 'Registrar Cliente'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Resumen del Cliente */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Cliente para esta venta: 
          <span className="font-medium text-gray-900 ml-2">
            {client ? client.name : 'Cliente Ocasional'}
          </span>
        </p>
      </div>
    </div>
  );
}