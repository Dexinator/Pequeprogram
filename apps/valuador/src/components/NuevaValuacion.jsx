import React, { useState } from 'react';
import { ProductoForm } from './ProductoForm';
import { ClienteForm } from './ClienteForm';

// En un proyecto Astro puedes importar el layout directamente o usar un componente Layout React
// Para este ejemplo, asumimos que estamos usando la integración de React en Astro

export default function NuevaValuacion() {
  // Generar ID único para la valuación
  const valuacionId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const fecha = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  
  // Estado para cliente
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    identificacion: ''
  });
  
  // Estado para los productos
  const [productos, setProductos] = useState([{ id: 0 }]);
  
  // Estado para el resumen
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [resumen, setResumen] = useState({
    totalProductos: 0,
    valorCompra: 0,
    valorVenta: 0,
    detalleProductos: []
  });
  
  // Manejar cambios en el formulario de cliente
  const handleClienteChange = (clienteData) => {
    setCliente(clienteData);
  };
  
  // Agregar un nuevo producto
  const agregarProducto = () => {
    setProductos(prev => [...prev, { id: Date.now() }]);
  };
  
  // Eliminar un producto
  const eliminarProducto = (id) => {
    setProductos(prev => prev.filter(producto => producto.id !== id));
  };
  
  // Generar resumen de valuación
  const generarResumen = () => {
    // En un caso real, aquí recopilaríamos todos los datos de los productos
    // Para este ejemplo, generamos datos ficticios
    
    if (!cliente.nombre || !cliente.telefono) {
      alert('Por favor complete al menos el nombre y teléfono del cliente');
      return;
    }
    
    // Simulación de productos valorados
    const productosValorados = productos.map((p, idx) => ({
      id: p.id,
      index: idx,
      categoria: "Categoría " + (idx + 1),
      marca: "Marca " + (idx + 1),
      estado: "Bueno",
      modalidad: "Compra directa",
      precioCompra: Math.floor(Math.random() * 500) + 100,
      precioVenta: Math.floor(Math.random() * 1000) + 500
    }));
    
    const totalCompra = productosValorados.reduce((sum, p) => sum + p.precioCompra, 0);
    const totalVenta = productosValorados.reduce((sum, p) => sum + p.precioVenta, 0);
    
    setResumen({
      totalProductos: productosValorados.length,
      valorCompra: totalCompra,
      valorVenta: totalVenta,
      detalleProductos: productosValorados
    });
    
    setMostrarResumen(true);
  };
  
  // Finalizar valuación
  const finalizarValuacion = (e) => {
    e.preventDefault();
    
    // Simulación: En un caso real, enviaríamos los datos al servidor
    alert('Valuación finalizada con éxito. En una implementación real, estos datos se guardarían en la base de datos.');
    
    // Redirigir al historial (simular)
    setTimeout(() => {
      window.location.href = '/historial';
    }, 1000);
  };
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-azul-profundo">Nueva Valuación</h1>
        <div className="flex items-center gap-3">
          <span className="bg-azul-claro text-white text-sm py-1 px-3 rounded-full">Fecha: {fecha}</span>
          <span className="bg-amarillo text-white text-sm py-1 px-3 rounded-full">ID: VP-{valuacionId}</span>
        </div>
      </div>
      
      <p className="text-text-muted">
        Complete los datos del cliente y los artículos para obtener una valuación precisa. Los campos marcados con 
        <span className="text-rosa">*</span> son obligatorios.
      </p>

      <form id="valuacion-form" className="mt-6 space-y-8" onSubmit={finalizarValuacion}>
        {/* Sección de Cliente */}
        <ClienteForm 
          id="cliente-principal" 
          className="mb-8" 
          initialData={cliente}
          onChange={handleClienteChange}
        />
        
        {/* Sección de Productos */}
        <div className="mb-4">
          <h2 className="text-2xl font-heading font-bold text-azul-profundo mb-2">Productos</h2>
          <p className="text-text-muted">Agregue todos los productos que desea valuar.</p>
        </div>
        
        {/* Contenedor de productos */}
        <div id="productos-container">
          {productos.map((producto, index) => (
            <ProductoForm 
              key={producto.id}
              id="producto"
              index={index}
              onRemove={() => eliminarProducto(producto.id)}
            />
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={agregarProducto}
            className="px-5 py-2 border border-azul-claro text-azul-claro bg-azul-claro/10 rounded-md hover:bg-azul-claro/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar otro producto
            </span>
          </button>
        </div>
        
        {/* Resumen de la valuación */}
        {mostrarResumen && (
          <div id="resumen-container" className="bg-background-alt p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-heading font-bold text-verde-oscuro mb-4">Resumen de Valuación</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Datos del Cliente</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Nombre:</span> {cliente.nombre}</p>
                  <p><span className="font-medium">Teléfono:</span> {cliente.telefono}</p>
                  {cliente.email && <p><span className="font-medium">Email:</span> {cliente.email}</p>}
                  {cliente.identificacion && <p><span className="font-medium">Identificación:</span> {cliente.identificacion}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Totales</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Total productos:</span>
                    <span className="font-bold">{resumen.totalProductos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor total de compra:</span>
                    <span className="font-bold text-azul-profundo">${resumen.valorCompra.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor total de venta:</span>
                    <span className="font-bold text-verde-oscuro">${resumen.valorVenta.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Detalle de Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">#</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Categoría</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Marca</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Estado</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-muted tracking-wider">Modalidad</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-text-muted tracking-wider">Precio Compra</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-text-muted tracking-wider">Precio Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {resumen.detalleProductos.map((producto, index) => (
                      <tr key={producto.id}>
                        <td className="px-3 py-2 whitespace-nowrap">{index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{producto.categoria}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{producto.marca}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{producto.estado}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{producto.modalidad}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">${producto.precioCompra.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">${producto.precioVenta.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-between pt-4 border-t border-border">
          <button 
            type="button" 
            onClick={() => {
              if (confirm('¿Está seguro que desea cancelar esta valuación? Se perderán todos los datos.')) {
                window.location.href = '/';
              }
            }}
            className="px-5 py-2 border border-border bg-background rounded-md hover:bg-background-alt transition-colors"
          >
            Cancelar
          </button>
          
          <div className="space-x-3">
            <button 
              type="button" 
              onClick={() => alert('Borrador guardado correctamente. En una implementación real, se guardaría el estado actual en la base de datos.')}
              className="px-5 py-2 border border-border bg-background rounded-md hover:bg-background-alt transition-colors"
            >
              Guardar borrador
            </button>
            
            <button 
              type="button" 
              onClick={generarResumen}
              className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
            >
              Generar Resumen
            </button>
            
            {mostrarResumen && (
              <button 
                type="submit" 
                className="px-5 py-2 bg-azul-claro text-white rounded-md hover:bg-azul-profundo transition-colors"
              >
                Finalizar Valuación
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 