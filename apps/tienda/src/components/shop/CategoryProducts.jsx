import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import ProductFilters from './ProductFilters';

const CategoryProducts = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: category.id
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [subcategories, setSubcategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const PRODUCTS_PER_PAGE = 20;
  
  // Cargar subcategorías al montar el componente
  useEffect(() => {
    loadSubcategories();
  }, [category.id]);
  
  // Cargar productos cuando cambian los filtros o la página
  useEffect(() => {
    loadProducts();
  }, [filters, currentPage]);
  
  const loadSubcategories = async () => {
    try {
      const subs = await productsService.getSubcategories(category.id);
      setSubcategories(subs);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getOnlineProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        filters
      });
      
      setProducts(response.products);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters
    });
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
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
      {/* Header de categoría */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-4">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">Inicio</a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <a href="/categorias" className="text-gray-500 hover:text-gray-700">Categorías</a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{category.name}</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {category.name}
          </h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} productos encontrados` : 'Cargando productos...'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              categoryId={category.id}
              subcategories={subcategories}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
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
              emptyMessage={`No se encontraron productos en ${category.name}`}
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
              <ProductFilters
                categoryId={category.id}
                subcategories={subcategories}
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

export default CategoryProducts;