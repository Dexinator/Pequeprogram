import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import ProductFilters from './ProductFilters';

const SearchResults = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const PRODUCTS_PER_PAGE = 20;
  
  // Buscar cuando cambia la query, filtros o página
  useEffect(() => {
    if (query.trim()) {
      searchProducts();
    } else {
      setProducts([]);
      setTotal(0);
    }
  }, [query, filters, currentPage]);
  
  const searchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.searchProducts(query, {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        filters
      });
      
      setProducts(response.products);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setCurrentPage(1);
    setFilters({});
    // Actualizar URL sin recargar la página
    window.history.pushState({}, '', `/buscar?q=${encodeURIComponent(newQuery)}`);
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSortChange = (sortValue) => {
    setFilters({
      ...filters,
      sort: sortValue
    });
    setCurrentPage(1);
  };
  
  // Sugerencias de búsqueda relacionadas
  const getSearchSuggestions = () => {
    if (!query) return [];
    
    // Aquí podrías implementar lógica más sofisticada
    const suggestions = [
      `${query} nuevo`,
      `${query} usado`,
      `${query} barato`,
      `${query} marca`
    ];
    
    return suggestions.slice(0, 4);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de búsqueda */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {query && (
            <div className="mt-4 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {total > 0 ? (
                  <>Resultados para "<span className="text-pink-600">{query}</span>"</>
                ) : (
                  <>Buscando "<span className="text-pink-600">{query}</span>"...</>
                )}
              </h1>
              {!loading && total > 0 && (
                <p className="text-gray-600 mt-2">
                  {total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {query ? (
        <div className="container mx-auto px-4 py-8">
          {/* Sugerencias de búsqueda */}
          {!loading && total > 0 && getSearchSuggestions().length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">También puedes buscar:</p>
              <div className="flex flex-wrap gap-2">
                {getSearchSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de filtros - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <ProductFilters
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </aside>
            
            {/* Contenido principal */}
            <div className="flex-1">
              {/* Barra de herramientas */}
              {(products.length > 0 || loading) && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Botón de filtros móvil */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 text-gray-700 hover:text-pink-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filtros
                    </button>
                    
                    {/* Ordenamiento */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="sort" className="text-sm text-gray-600">
                        Ordenar por:
                      </label>
                      <select
                        id="sort"
                        value={filters.sort || ''}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Relevancia</option>
                        <option value="price_asc">Precio: menor a mayor</option>
                        <option value="price_desc">Precio: mayor a menor</option>
                        <option value="newest">Más recientes</option>
                        <option value="name_asc">Nombre: A-Z</option>
                        <option value="name_desc">Nombre: Z-A</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resultados */}
              {!loading && products.length === 0 && query && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No encontramos resultados para "{query}"
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Intenta con otros términos de búsqueda o explora nuestras categorías
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="/categorias" 
                      className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Ver categorías
                    </a>
                    <a 
                      href="/productos" 
                      className="inline-block bg-white text-pink-600 border-2 border-pink-600 px-6 py-2 rounded-lg hover:bg-pink-50 transition-colors"
                    >
                      Ver todos los productos
                    </a>
                  </div>
                </div>
              )}
              
              {/* Grid de productos */}
              {(loading || products.length > 0) && (
                <ProductGrid
                  products={products}
                  loading={loading}
                  emptyMessage={`No se encontraron productos para "${query}"`}
                />
              )}
              
              {/* Paginación */}
              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Estado inicial sin búsqueda */
        <div className="container mx-auto px-4 py-16">
          <div className="w-full max-w-full sm:max-w-2xl mx-auto text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Qué estás buscando?
            </h1>
            <p className="text-gray-600 mb-8">
              Usa la barra de búsqueda para encontrar productos específicos
            </p>
            
            {/* Búsquedas populares */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3">Búsquedas populares:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Carriola', 'Cuna', 'Ropa bebé', 'Juguetes', 'Silla auto'].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <a 
                href="/categorias" 
                className="text-pink-600 hover:text-pink-700 transition-colors"
              >
                Explorar categorías →
              </a>
              <a 
                href="/productos" 
                className="text-pink-600 hover:text-pink-700 transition-colors"
              >
                Ver todos los productos →
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de filtros móvil */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <ProductFilters
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setShowFilters(false);
                }}
                currentFilters={filters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;