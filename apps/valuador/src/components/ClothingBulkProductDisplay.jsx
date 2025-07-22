import React from 'react';

export default function ClothingBulkProductDisplay({ product, index, onRemove }) {
  const { data } = product;
  
  return (
    <div className="bg-background-alt p-6 rounded-lg shadow-sm border border-border relative">
      <button
        className="absolute top-4 right-4 text-rosa hover:text-rosa/80 transition-colors"
        onClick={onRemove}
        type="button"
        title="Eliminar producto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <h3 className="text-lg font-heading font-bold text-azul-claro mb-4">
        Producto de Ropa #{index + 1} (Valuación Masiva)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Tipo de Prenda</p>
          <p className="font-medium">{data.garmentType}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Calidad</p>
          <p className="font-medium">
            {data.qualityLevel === 'economico' ? 'Económico' :
             data.qualityLevel === 'estandar' ? 'Estándar' :
             data.qualityLevel === 'alto' ? 'Alto' :
             data.qualityLevel === 'premium' ? 'Premium' : data.qualityLevel}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Talla</p>
          <p className="font-medium">{data.size}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Cantidad</p>
          <p className="font-medium">{data.quantity} unidades</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Precio Compra</p>
          <p className="font-medium text-verde-oscuro">
            ${typeof data.suggested_purchase_price === 'number' 
              ? data.suggested_purchase_price.toFixed(2) 
              : parseFloat(data.suggested_purchase_price || 0).toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Precio Venta</p>
          <p className="font-medium text-azul-claro">
            ${typeof data.suggested_sale_price === 'number' 
              ? data.suggested_sale_price.toFixed(2) 
              : parseFloat(data.suggested_sale_price || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <p className="text-gray-600">{data.notes}</p>
      </div>
    </div>
  );
}