import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';

// Datos de prueba para las categorías
const categorias = [
  { id: 1, nombre: "Ropa Infantil" },
  { id: 2, nombre: "Juguetes" },
  { id: 3, nombre: "Mobiliario" },
  { id: 4, nombre: "Coches y Sillas" },
  { id: 5, nombre: "Lactancia" },
  { id: 6, nombre: "Accesorios" }
];

// Datos de prueba para subcategorías
const subcategorias = {
  1: [
    { id: 101, nombre: "Ropa (0-6 meses)" },
    { id: 102, nombre: "Ropa (6-12 meses)" },
    { id: 103, nombre: "Ropa (1-3 años)" },
    { id: 104, nombre: "Ropa (3+ años)" }
  ],
  2: [
    { id: 201, nombre: "Juguetes didácticos" },
    { id: 202, nombre: "Muñecas y figuras" },
    { id: 203, nombre: "Juegos de mesa" },
    { id: 204, nombre: "Vehículos y pistas" }
  ],
  3: [
    { id: 301, nombre: "Cunas" },
    { id: 302, nombre: "Moisés" },
    { id: 303, nombre: "Cómodas" },
    { id: 304, nombre: "Parques" }
  ],
  4: [
    { id: 401, nombre: "Cochecitos" },
    { id: 402, nombre: "Sillas de auto" },
    { id: 403, nombre: "Portabebés" }
  ],
  5: [
    { id: 501, nombre: "Extractores" },
    { id: 502, nombre: "Biberones" },
    { id: 503, nombre: "Esterilizadores" }
  ],
  6: [
    { id: 601, nombre: "Chupetes" },
    { id: 602, nombre: "Mordedores" },
    { id: 603, nombre: "Monitores" }
  ]
};

export function ProductoForm({ id = "producto-form", index = 0, className = "", onRemove }) {
  const productoId = `${id}-${index}`;
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaOptions, setSubcategoriaOptions] = useState([]);
  const [mostrarNuevaMarca, setMostrarNuevaMarca] = useState(false);
  const [resultado, setResultado] = useState({ visible: false, precioCompra: 0, precioVenta: 0 });

  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaSeleccionada) {
      const options = subcategorias[categoriaSeleccionada] || [];
      setSubcategoriaOptions(options);
    } else {
      setSubcategoriaOptions([]);
    }
  }, [categoriaSeleccionada]);

  // Simular cálculo de valoración
  const calcularValoracion = () => {
    // En un caso real, esta lógica sería más compleja y basada en todos los campos
    const precioCompraBase = Math.floor(Math.random() * 1000) + 100;
    const precioVenta = Math.floor(precioCompraBase * 1.8);
    
    setResultado({
      visible: true,
      precioCompra: precioCompraBase,
      precioVenta: precioVenta
    });
  };

  return (
    <div className={`producto-form ${className}`} data-index={index}>
      <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-heading font-bold text-azul-claro">Producto #{index + 1}</h2>
          
          {index > 0 && (
            <button 
              type="button" 
              className="text-rosa hover:text-rosa/80 p-1 remove-producto"
              onClick={onRemove}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Sección 1: Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`categoria-${productoId}`}>
              Categoría <span className="text-rosa">*</span>
            </label>
            <select 
              id={`categoria-${productoId}`} 
              name={`categoria-${productoId}`} 
              data-producto-id={productoId}
              className="categoria-select w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`subcategoria-${productoId}`}>
              Subcategoría <span className="text-rosa">*</span>
            </label>
            <select 
              id={`subcategoria-${productoId}`} 
              name={`subcategoria-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
              disabled={!categoriaSeleccionada}
            >
              <option value="">
                {categoriaSeleccionada 
                  ? "Seleccionar subcategoría" 
                  : "Seleccione primero una categoría"}
              </option>
              {subcategoriaOptions.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`estado-${productoId}`}>
              Estado <span className="text-rosa">*</span>
            </label>
            <select 
              id={`estado-${productoId}`} 
              name={`estado-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
            >
              <option value="">Seleccionar estado</option>
              <option value="excelente">Excelente</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="con_detalles">Con detalles</option>
            </select>
          </div>
        </div>
        
        {/* Sección 2: Marca y Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`marca-${productoId}`}>
              Marca <span className="text-rosa">*</span>
            </label>
            <div className="flex gap-2">
              <select 
                id={`marca-${productoId}`} 
                name={`marca-${productoId}`}
                className="flex-1 p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              >
                <option value="">Seleccionar marca</option>
                <option value="fisher_price">Fisher Price</option>
                <option value="chicco">Chicco</option>
                <option value="graco">Graco</option>
                <option value="carter">Carter's</option>
                <option value="otro">Otra marca...</option>
              </select>
              <button 
                type="button"
                className="px-3 py-2 bg-background border border-border rounded-md hover:bg-background-alt transition-colors"
                onClick={() => setMostrarNuevaMarca(!mostrarNuevaMarca)}
              >
                +
              </button>
            </div>
            
            {mostrarNuevaMarca && (
              <div className="mt-2">
                <input 
                  type="text" 
                  id={`nueva-marca-${productoId}`} 
                  name={`nueva-marca-${productoId}`} 
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  placeholder="Nombre de la marca" 
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`renombre-${productoId}`}>
              Renombre de Marca <span className="text-rosa">*</span>
            </label>
            <select 
              id={`renombre-${productoId}`} 
              name={`renombre-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
            >
              <option value="">Seleccionar renombre</option>
              <option value="sencilla">Sencilla</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium" htmlFor={`modalidad-${productoId}`}>
              Modalidad <span className="text-rosa">*</span>
            </label>
            <select 
              id={`modalidad-${productoId}`} 
              name={`modalidad-${productoId}`} 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
              required
            >
              <option value="">Seleccionar modalidad</option>
              <option value="compra">Compra directa</option>
              <option value="consignacion">Consignación</option>
            </select>
          </div>
        </div>
        
        {/* Botón de Valorar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={calcularValoracion}
            className="px-5 py-2 bg-verde-lima text-white rounded-md hover:bg-verde-oscuro transition-colors"
          >
            Valorar Producto
          </button>
        </div>
        
        {/* Resultado de valoración */}
        {resultado.visible && (
          <div id={`resultado-${productoId}`} className="mt-4 p-4 bg-verde-lima/10 border border-verde-lima rounded-md">
            <h3 className="text-lg font-bold text-verde-oscuro mb-2">Resultado de Valoración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted">Precio sugerido de compra:</p>
                <p className="text-xl font-bold text-azul-profundo" id={`precio-compra-${productoId}`}>
                  {resultado.precioCompra.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Precio sugerido de venta:</p>
                <p className="text-xl font-bold text-verde-oscuro" id={`precio-venta-${productoId}`}>
                  {resultado.precioVenta.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 