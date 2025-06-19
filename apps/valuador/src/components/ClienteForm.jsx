import React, { useState, useEffect } from 'react';
import { ValuationService } from '../services';

export function ClienteForm({ 
  id = "cliente-form", 
  className = "",
  initialData = { name: '', phone: '', email: '', identification: '' },
  onChange = () => {}
}) {
  const [tipoCliente, setTipoCliente] = useState('nuevo');
  const [formData, setFormData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const valuationService = new ValuationService();

  // Actualizar formData cuando cambien los initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onChange(newFormData);
  };
  
  // Buscar clientes
  const searchClients = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await valuationService.searchClients(searchTerm);
      setSearchResults(results);
      setShowResults(true);
      
      // Si no hay resultados, mostrar mensaje apropiado
      if (results.length === 0) {
        setSearchError('No se encontraron clientes con ese término de búsqueda');
      }
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      setSearchResults([]);
      setShowResults(false);
      
      // Manejar diferentes tipos de errores
      if (error.message?.includes('iniciar sesión') || 
          error.message?.includes('autenticado') || 
          error.message?.includes('Token') ||
          error.status === 401) {
        setSearchError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        
        // Opcional: redirigir al login después de un momento
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 3000);
      } else if (error.status === 500) {
        setSearchError('Error del servidor. Por favor, intente nuevamente.');
      } else {
        setSearchError('Error al buscar clientes. Verifique su conexión e intente nuevamente.');
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  // Seleccionar un cliente de los resultados
  const selectClient = (client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      identification: client.identification || ''
    });
    onChange({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      identification: client.identification || '',
      id: client.id
    });
    setShowResults(false);
    setSearchError(null); // Limpiar cualquier error previo
  };
  
  // Buscar cuando se presiona Enter en el campo de búsqueda
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchClients();
    }
  };
  
  return (
    <div className={`cliente-form ${className}`}>
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-heading font-bold mb-4 text-azul-claro">Datos del Cliente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="cliente-tipo">
              Tipo de Cliente
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="cliente-tipo" 
                  value="nuevo" 
                  className="text-azul-claro border-border focus:ring-azul-claro/50 mr-2" 
                  checked={tipoCliente === 'nuevo'} 
                  onChange={() => setTipoCliente('nuevo')}
                />
                Nuevo
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="cliente-tipo" 
                  value="existente" 
                  className="text-azul-claro border-border focus:ring-azul-claro/50 mr-2"
                  checked={tipoCliente === 'existente'} 
                  onChange={() => setTipoCliente('existente')}
                />
                Existente
              </label>
            </div>
          </div>
          
          {tipoCliente === 'existente' && (
            <div className="space-y-2 cliente-busqueda">
              <label className="block font-medium" htmlFor="cliente-buscar">
                Buscar Cliente
              </label>
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  id="cliente-buscar" 
                  name="cliente-buscar" 
                  className="flex-1 p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  placeholder="Buscar por nombre o teléfono"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Limpiar errores cuando el usuario escriba
                    if (searchError) {
                      setSearchError(null);
                    }
                    // Ocultar resultados previos
                    if (showResults) {
                      setShowResults(false);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
                  onClick={searchClients}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
                
                {/* Resultados de búsqueda */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    <ul>
                      {searchResults.map(client => (
                        <li 
                          key={client.id}
                          className="p-2 hover:bg-background-alt cursor-pointer border-b border-border last:border-b-0"
                          onClick={() => selectClient(client)}
                        >
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-text-muted">{client.phone}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {showResults && searchResults.length === 0 && !searchError && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 p-2">
                    <p className="text-text-muted">No se encontraron resultados</p>
                  </div>
                )}
                
                {searchError && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-rosa rounded-md shadow-lg z-10 p-2">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-rosa mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-rosa text-sm">{searchError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="name">
              Nombre <span className="text-rosa">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              placeholder="Nombre completo" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="phone">
              Teléfono <span className="text-rosa">*</span>
            </label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              placeholder="10 dígitos" 
              pattern="[0-9]{10}"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="email">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              placeholder="ejemplo@correo.com" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="identification">
              Identificación Oficial
            </label>
            <input 
              type="text" 
              id="identification" 
              name="identification" 
              value={formData.identification}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              placeholder="INE, pasaporte, etc." 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 