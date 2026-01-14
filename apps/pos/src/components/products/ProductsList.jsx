import React, { useState, useEffect, useCallback } from 'react';
import { productsService } from '../../services/products.service';
import ProductEditModal from './ProductEditModal';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Filters
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filters, setFilters] = useState({
    category_id: '',
    subcategory_id: '',
    location: '',
    search: '',
    has_notes: '',
    online_ready: ''
  });

  // Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (filters.category_id) {
      loadSubcategories(parseInt(filters.category_id));
    } else {
      setSubcategories([]);
      setFilters(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [filters.category_id]);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [pagination.page, filters.category_id, filters.subcategory_id, filters.location, filters.has_notes, filters.online_ready]);

  const loadCategories = async () => {
    const cats = await productsService.getCategories();
    setCategories(cats);
  };

  const loadSubcategories = async (categoryId) => {
    const subcats = await productsService.getSubcategories(categoryId);
    setSubcategories(subcats);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.category_id && { category_id: parseInt(filters.category_id) }),
        ...(filters.subcategory_id && { subcategory_id: parseInt(filters.subcategory_id) }),
        ...(filters.location && { location: filters.location }),
        ...(filters.search && { search: filters.search }),
        ...(filters.has_notes !== '' && { has_notes: filters.has_notes === 'true' }),
        ...(filters.online_ready !== '' && { online_ready: filters.online_ready === 'true' })
      };

      const result = await productsService.getProducts(params);
      setProducts(result.products);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProducts();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (field !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleProductUpdated = () => {
    loadProducts();
    handleModalClose();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      subcategory_id: '',
      location: '',
      search: '',
      has_notes: '',
      online_ready: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">Todas las categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoria
            </label>
            <select
              value={filters.subcategory_id}
              onChange={(e) => handleFilterChange('subcategory_id', e.target.value)}
              disabled={!filters.category_id}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 disabled:bg-gray-100"
            >
              <option value="">Todas las subcategorias</option>
              {subcategories.map((subcat) => (
                <option key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicacion
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="Polanco">Polanco</option>
              <option value="Satelite">Satelite</option>
            </select>
          </div>

          {/* Online status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Online
            </label>
            <select
              value={filters.online_ready}
              onChange={(e) => handleFilterChange('online_ready', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">Todos</option>
              <option value="true">Publicados</option>
              <option value="false">No publicados</option>
            </select>
          </div>
        </div>

        {/* Search and additional filters */}
        <div className="mt-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="SKU, nombre, marca, notas..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Con Notas
            </label>
            <select
              value={filters.has_notes}
              onChange={(e) => handleFilterChange('has_notes', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">Todos</option>
              <option value="true">Con notas</option>
              <option value="false">Sin notas</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando {products.length} de {pagination.total} productos
        </p>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron productos con los filtros seleccionados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.inventory_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {product.inventory_id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {product.subcategory_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.brand_name || 'Sin marca'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {productsService.formatCurrency(product.online_price || product.final_sale_price)}
                      </div>
                      {product.online_price && product.online_price !== product.final_sale_price && (
                        <div className="text-xs text-gray-500">
                          Tienda: {productsService.formatCurrency(product.final_sale_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.online_store_ready
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.online_store_ready ? 'Publicado' : 'No publicado'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.location} | Qty: {product.quantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.notes ? (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 truncate" title={product.notes}>
                            {product.notes}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin notas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-pink-600 hover:text-pink-900 font-medium text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Pagina <span className="font-medium">{pagination.page}</span> de{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Primera
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Ultima
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          onClose={handleModalClose}
          onSave={handleProductUpdated}
        />
      )}
    </div>
  );
}
