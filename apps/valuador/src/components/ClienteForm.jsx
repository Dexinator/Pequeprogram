import React, { useState } from 'react';

export function ClienteForm({ 
  id = "cliente-form", 
  className = "",
  initialData = { nombre: '', telefono: '', email: '', identificacion: '' },
  onChange = () => {}
}) {
  const [tipoCliente, setTipoCliente] = useState('nuevo');
  const [formData, setFormData] = useState(initialData);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onChange(newFormData);
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
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="cliente-buscar" 
                  name="cliente-buscar" 
                  className="flex-1 p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  placeholder="Buscar por nombre o teléfono" 
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="nombre">
              Nombre <span className="text-rosa">*</span>
            </label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              placeholder="Nombre completo" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="telefono">
              Teléfono <span className="text-rosa">*</span>
            </label>
            <input 
              type="tel" 
              id="telefono" 
              name="telefono" 
              value={formData.telefono}
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
            <label className="block font-medium" htmlFor="identificacion">
              Identificación Oficial
            </label>
            <input 
              type="text" 
              id="identificacion" 
              name="identificacion" 
              value={formData.identificacion}
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