import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import ProductFilters from './ProductFilters';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  
  const PRODUCTS_PER_PAGE = 20;
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Cargar productos cuando cambian los filtros o la página
  useEffect(() => {
    loadProducts();
  }, [filters, currentPage]);
  
  const loadCategories = async () => {
    try {
      const cats = await productsService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 Cargando productos...');
      const response = await productsService.getOnlineProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        filters
      });
      
      console.log('✅ Respuesta recibida:', response);
      setProducts(response.products || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      setError(error.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-4">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">Inicio</a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">Todos los productos</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Todos los productos
          </h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} productos disponibles` : 'Cargando productos...'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Categorías */}
              {categories.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-3">Categoría</h4>
                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange({
                      ...filters,
                      category_id: e.target.value ? parseInt(e.target.value) : undefined,
                      subcategory_id: undefined // Reset subcategoría
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <ProductFilters
                categoryId={filters.category_id}
                subcategories={[]}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </div>
          </aside>
          
          {/* Contenido principal */}
          <div className="flex-1">
            {/* Barra de herramientas */}
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
                    <option value="">Más recientes</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                    <option value="name_asc">Nombre: A-Z</option>
                    <option value="name_desc">Nombre: Z-A</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Grid de productos */}
            <ProductGrid
              products={products}
              loading={loading}
              emptyMessage="No se encontraron productos"
            />
            
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
              {/* Categorías móvil */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Categoría</h4>
                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => {
                      handleFilterChange({
                        ...filters,
                        category_id: e.target.value ? parseInt(e.target.value) : undefined,
                        subcategory_id: undefined
                      });
                      setShowFilters(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <ProductFilters
                categoryId={filters.category_id}
                subcategories={[]}
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

export default AllProducts;