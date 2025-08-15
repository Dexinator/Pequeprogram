import React, { useState, useEffect, useRef } from 'react';
import { productsService } from '../../services/products.service';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);
  
  // Focus input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      // Load recent searches from localStorage
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5));
      
      // Load popular categories based on actual database structure
      setCategories([
        { name: 'A dormir', icon: '🛏️', slug: 'a-dormir' },
        { name: 'A jugar', icon: '🧸', slug: 'a-jugar' },
        { name: 'A pasear', icon: '🚗', slug: 'a-pasear' },
        { name: 'A comer', icon: '🍼', slug: 'a-comer' },
        { name: 'Ropa', icon: '👕', slug: 'ropa' },
        { name: 'En Casa', icon: '🏠', slug: 'en-casa' }
      ]);
    }
    
    // Reset when closing
    if (!isOpen) {
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [isOpen]);
  
  // Search suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await productsService.searchProducts(query, {
          limit: 8
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
  
  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const newRecent = [searchQuery, ...recent.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      
      // Navigate to search results
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };
  
  const handleSuggestionClick = (product) => {
    window.location.href = `/producto/${product.inventory_id}`;
  };
  
  const handleCategoryClick = (slug) => {
    window.location.href = `/categoria/${slug}`;
  };
  
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };
  
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-brand-amarillo/50 text-gray-900 font-semibold">{part}</mark>
        : part
    );
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };
  
  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative z-10 flex flex-col max-h-screen">
        <div className="bg-white dark:bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="border-b-4 border-brand-azul">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="¿Qué estás buscando para tu pequeño?"
                    className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-2xl 
                             focus:ring-4 focus:ring-brand-azul/20 focus:border-brand-azul 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    autoComplete="off"
                  />
                  
                  {/* Search/Loading Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {loading ? (
                      <svg className="w-6 h-6 animate-spin text-brand-azul" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                           text-gray-700 dark:text-gray-300 transition-all group"
                  aria-label="Cerrar búsqueda"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="py-4">
                <h3 className="text-sm font-heading font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Productos encontrados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((product, index) => (
                    <button
                      key={product.inventory_id}
                      onClick={() => handleSuggestionClick(product)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                                transition-all text-left group ${
                        selectedIndex === index ? 'bg-gray-50 dark:bg-gray-800' : ''
                      }`}
                    >
                      <img
                        src={product.images?.[0] || '/placeholder-product.svg'}
                        alt={product.subcategory_name}
                        className="w-16 h-16 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-gray-900 dark:text-gray-100">
                          {highlightMatch(`${product.subcategory_name} ${product.brand_name}`, query)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.category_name} • {formatPrice(product.online_price)}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-azul transition-colors" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
                
                {/* Ver todos los resultados */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleSearch()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-azul hover:bg-brand-azul-profundo 
                             text-white font-heading font-semibold rounded-xl shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 transition-all"
                  >
                    Ver todos los resultados
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* No results */}
            {showSuggestions && suggestions.length === 0 && !loading && query.length >= 2 && (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 
                              rounded-full mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-heading text-gray-600 dark:text-gray-400 mb-2">
                  No encontramos productos para "{query}"
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Intenta con otros términos o explora nuestras categorías
                </p>
              </div>
            )}
            
            {/* Initial state - Recent searches and categories */}
            {!showSuggestions && (
              <div className="py-6 space-y-8">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
                        Búsquedas recientes
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-gray-500 hover:text-brand-rosa transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-azul/10 dark:hover:bg-brand-azul/20 
                                   text-gray-700 dark:text-gray-300 rounded-full transition-all 
                                   border border-gray-200 dark:border-gray-700 hover:border-brand-azul"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {search}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Popular Categories */}
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Categorías populares
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="group p-4 bg-gradient-to-br from-brand-azul/5 to-brand-verde-lima/5 
                                 dark:from-brand-azul/10 dark:to-brand-verde-lima/10
                                 hover:from-brand-azul/10 hover:to-brand-verde-lima/10
                                 dark:hover:from-brand-azul/20 dark:hover:to-brand-verde-lima/20
                                 rounded-2xl transition-all transform hover:-translate-y-0.5 
                                 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl group-hover:animate-bounce">{category.icon}</span>
                          <span className="font-heading font-medium text-gray-900 dark:text-gray-100">
                            {category.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Quick tips */}
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 Tip: Puedes buscar por marca, categoría o características del producto
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;