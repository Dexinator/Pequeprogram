import React, { useState, useEffect, useRef } from 'react';
import { productsService } from '../../services/products.service';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);
  
  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Buscar sugerencias con debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Cancelar búsqueda anterior
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Debounce de 300ms
    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await productsService.searchProducts(query, {
          limit: 5
        });
        
        setSuggestions(response.products);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error al buscar:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`;
    }
  };
  
  const handleSuggestionClick = (product) => {
    window.location.href = `/producto/${product.inventory_id}`;
  };
  
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };
  
  const highlightMatch = (text, query) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200">{part}</mark>
        : part
    );
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-pink-600 transition-colors"
          aria-label="Buscar"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>
      
      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <ul className="py-2">
            {suggestions.map((product, index) => (
              <li key={product.inventory_id}>
                <button
                  onClick={() => handleSuggestionClick(product)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Sin+imagen'}
                    alt={product.subcategory_name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {highlightMatch(`${product.subcategory_name} ${product.brand_name}`, query)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.category_name} • {formatPrice(product.online_price)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t px-4 py-2 bg-gray-50">
            <button
              onClick={handleSearch}
              className="text-sm text-pink-600 hover:text-pink-700 transition-colors"
            >
              Ver todos los resultados para "{query}"
            </button>
          </div>
        </div>
      )}
      
      {/* No hay resultados */}
      {showSuggestions && suggestions.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          <p className="text-gray-500 text-center">
            No se encontraron productos para "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;