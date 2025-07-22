import React, { useState, useEffect } from 'react';
import { SalesService } from '../../services/sales.service';

const salesService = new SalesService();

export default function SearchProducts({ cart, setCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        searchInventory();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchInventory = async () => {
    setSearching(true);
    setError('');
    
    try {
      const response = await salesService.searchInventory({
        q: searchTerm,  // Cambiar de 'search' a 'q'
        available_only: true,
        location: 'Polanco'
      });
      
      setSearchResults(response.items || []);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setError('Error al buscar productos');
    } finally {
      setSearching(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Si ya está en el carrito, aumentar cantidad
      const newQuantity = existingItem.quantity_sold + 1;
      if (newQuantity <= product.quantity) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity_sold: newQuantity }
            : item
        ));
      } else {
        setError('No hay suficiente stock disponible');
      }
    } else {
      // Agregar nuevo producto al carrito
      setCart([...cart, {
        ...product,
        quantity_sold: 1,
        unit_price: parseFloat(product.final_sale_price) || 0
      }]);
    }
    
    // Limpiar búsqueda
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(item => item.id === productId);
    if (item && newQuantity > 0 && newQuantity <= item.quantity) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity_sold: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity_sold), 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Búsqueda de Productos</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID, categoría o marca..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        {searching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
          </div>
        )}
        
        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-auto">
            {searchResults.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{product.id}</div>
                    <div className="text-sm text-gray-600">{product.description}</div>
                    <div className="text-xs text-gray-500">Stock: {product.quantity}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium">
                      {product.final_sale_price 
                        ? `$${parseFloat(product.final_sale_price).toFixed(2)}`
                        : 'Sin precio'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Carrito de Compras</h4>
        
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay productos en el carrito
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{item.id}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                    <div className="text-sm text-gray-500">
                      ${item.unit_price.toFixed(2)} x {item.quantity_sold} = ${(item.unit_price * item.quantity_sold).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity_sold - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity_sold}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center border border-gray-300 rounded"
                      min="1"
                      max={item.quantity}
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity_sold + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}