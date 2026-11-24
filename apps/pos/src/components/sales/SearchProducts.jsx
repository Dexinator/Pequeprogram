import React, { useState, useEffect, useRef } from 'react';
import { SalesService } from '../../services/sales.service';

const salesService = new SalesService();

export default function SearchProducts({ cart, setCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  // Último artículo que sí entró al carrito. El lector pita por su cuenta,
  // aunque el POS no haya registrado nada: Pablo reportó que *"a veces suena
  // el scanner pero no detecta el artículo"* y la pieza se queda fuera de la
  // cuenta. El pitido no se puede controlar, así que la pantalla tiene que
  // decir qué entró y cuántas piezas van, para poder compararlas con el montón.
  const [ultimoEscaneado, setUltimoEscaneado] = useState(null);
  const inputRef = useRef(null);

  // El lector escribe en donde esté el cursor. Si se perdió el foco, el código
  // se va a la nada y esa pieza no se cobra; se devuelve tras cada escaneo.
  const enfocarLector = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  // Piezas, no renglones: dos playeras iguales son un renglón y dos piezas, y
  // lo que se cuenta a mano en el mostrador son piezas.
  const piezasEnCarrito = cart.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);

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

  // Handles a barcode scan or manual Enter press: looks up the exact SKU and
  // adds it to the cart in one step. Scanners type the code rapidly and emit
  // Enter at the end, so this gives a true scan-and-go flow without any
  // intermediate clicks.
  const handleScanSubmit = async (rawCode) => {
    setSearching(true);
    setError('');
    try {
      const response = await salesService.searchInventory({
        q: rawCode,
        available_only: true,
        location: 'Polanco',
      });
      const items = response.items || [];
      const exactMatch = items.find(it => it.id === rawCode) || (items.length === 1 ? items[0] : null);
      if (exactMatch) {
        addToCart(exactMatch);
      } else if (items.length > 1) {
        setSearchResults(items);
        setUltimoEscaneado(null);
        setError('Varios productos coinciden con ese código. Elige uno.');
      } else {
        // Se borra el aviso anterior: si se queda el "sí entró" de la pieza
        // pasada, el pitido más el letrero viejo hacen creer que esta también
        // entró.
        setUltimoEscaneado(null);
        setError(`No se encontró ningún producto con código "${rawCode}". Esta pieza NO está en el carrito.`);
      }
    } catch (err) {
      console.error('Error en escaneo:', err);
      setUltimoEscaneado(null);
      setError('Error al buscar el producto escaneado. Esta pieza NO está en el carrito.');
    } finally {
      setSearching(false);
      enfocarLector();
    }
  };

  /**
   * Aquí estaba la causa de fondo de lo que reportó Pablo.
   *
   * `handleScanSubmit` espera la consulta al API antes de agregar, y el carrito
   * se armaba con el valor capturado en el momento de la tecla
   * (`setCart([...cart, nuevo])`). Dos escaneos seguidos —el lector dispara
   * rapidísimo— tomaban los dos el mismo carrito viejo y el segundo
   * sobrescribía al primero: el lector pitaba, el artículo se encontraba, y la
   * pieza desaparecía sin aviso.
   *
   * Con la forma funcional (`setCart(prev => …)`) cada escaneo parte del
   * carrito que de verdad hay en ese instante, así que no se pierde ninguno por
   * rápido que entren.
   */
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const sinStock = existingItem && existingItem.quantity_sold + 1 > product.quantity;

    if (sinStock) {
      setUltimoEscaneado(null);
      setError(
        `Solo hay ${product.quantity} pieza(s) de ${product.id} y ya están en el carrito. Esta NO se agregó.`
      );
      setSearchTerm('');
      setSearchResults([]);
      enfocarLector();
      return;
    }

    setCart(prev => {
      const enCarrito = prev.find(item => item.id === product.id);
      if (!enCarrito) {
        return [
          ...prev,
          {
            ...product,
            quantity_sold: 1,
            unit_price: parseFloat(product.final_sale_price) || 0,
          },
        ];
      }
      // El tope se revisa otra vez contra el carrito real, no contra el que se
      // tenía al escanear, para no vender más piezas de las que hay.
      const nuevaCantidad = enCarrito.quantity_sold + 1;
      if (nuevaCantidad > product.quantity) return prev;
      return prev.map(item =>
        item.id === product.id ? { ...item, quantity_sold: nuevaCantidad } : item
      );
    });

    setUltimoEscaneado(product);
    setError('');
    setSearchTerm('');
    setSearchResults([]);
    enfocarLector();
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
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Búsqueda de Productos</h3>
        {/* El contador va arriba y grande, al lado del campo de escaneo, para
            poder cotejarlo con las piezas que están sobre el mostrador. */}
        <div className="text-right">
          <div className="text-2xl font-bold text-pink-600 leading-none">{piezasEnCarrito}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {piezasEnCarrito === 1 ? 'pieza escaneada' : 'piezas escaneadas'}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-medium">
          {error}
        </div>
      )}

      {!error && ultimoEscaneado && (
        <div className="bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded text-sm flex items-center justify-between gap-4">
          <span>
            <span className="font-semibold">✓ Agregado:</span>{' '}
            {ultimoEscaneado.description || ultimoEscaneado.id}
            <span className="text-green-700 font-mono text-xs ml-2">{ultimoEscaneado.id}</span>
          </span>
          <span className="whitespace-nowrap font-semibold">pieza {piezasEnCarrito}</span>
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim().length > 0) {
              e.preventDefault();
              handleScanSubmit(searchTerm.trim());
            }
          }}
          placeholder="Buscar o escanear código de barras..."
          autoFocus
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
        <h4 className="font-medium text-gray-700 mb-3">
          Carrito de Compras
          {cart.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              {piezasEnCarrito} {piezasEnCarrito === 1 ? 'pieza' : 'piezas'} en {cart.length}{' '}
              {cart.length === 1 ? 'artículo' : 'artículos'}
            </span>
          )}
        </h4>

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
                <span>
                  Total
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({piezasEnCarrito} {piezasEnCarrito === 1 ? 'pieza' : 'piezas'})
                  </span>
                </span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}