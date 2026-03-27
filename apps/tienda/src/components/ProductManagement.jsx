import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store.service';
import { productsService } from '../services/products.service';
import ProductEditModal from './ProductEditModal';
import BulkActionsBar from './BulkActionsBar';
import OptionalAuthGuard from './auth/OptionalAuthGuard';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { EMPLOYEE_ROLES } from '../config/routes.config';

const ProductCard = ({ product, isSelected, onSelect, onEdit }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all p-4 border-2 ${
      isSelected ? 'border-brand-rosa' : 'border-transparent'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox de selección */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.inventory_id, e.target.checked)}
          className="mt-1 h-5 w-5 text-brand-rosa focus:ring-brand-rosa border-gray-300 rounded"
        />

        {/* Imagen */}
        <div className="flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.subcategory_name}
              className="w-20 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{product.inventory_id}</p>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {product.subcategory_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand_name}</p>
            </div>

            {product.online_featured && (
              <span className="ml-2 text-yellow-500 flex-shrink-0" title="Producto destacado">
                ⭐
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`px-2 py-1 text-xs rounded ${
              product.condition_state === 'excelente' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              product.condition_state === 'bueno' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {product.condition_state}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Stock: {product.quantity}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.weight_grams ? `${(product.weight_grams / 1000).toFixed(2)} kg` : 'Sin peso'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-brand-rosa">
              {formatCurrency(product.online_price)}
            </p>
            <button
              onClick={() => onEdit(product)}
              className="text-sm text-brand-azul hover:text-brand-azul-profundo font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagementContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category_id: '',
    subcategory_id: '',
    featured: '',
    location: '',
    sort: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [filters]);

  useEffect(() => {
    if (filters.category_id) {
      loadSubcategories(parseInt(filters.category_id));
    } else {
      setSubcategories([]);
    }
  }, [filters.category_id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filterParams = {};

      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== undefined) {
          if (key === 'featured') {
            filterParams[key] = filters[key] === 'true';
          } else {
            filterParams[key] = filters[key];
          }
        }
      });

      const response = await storeService.getPublishedProducts(filterParams);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await storeService.getStoreStats();
      setStats(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await productsService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const subs = await productsService.getSubcategories(categoryId);
      setSubcategories(subs);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const handleProductSaved = () => {
    setSelectedProduct(null);
    setSelectedProducts([]);
    loadProducts();
    loadStats();
  };

  const handleSelectProduct = (inventoryId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, inventoryId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== inventoryId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.inventory_id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkAction = async (action, data) => {
    try {
      await storeService.bulkUpdateProducts(selectedProducts, action, data);
      setSelectedProducts([]);
      loadProducts();
      loadStats();
    } catch (error) {
      console.error('Error en acción masiva:', error);
      alert(error.message || 'Error al procesar la acción');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Gestión de Productos Publicados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los productos que están actualmente en la tienda online
          </p>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total publicados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.online_products}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_products}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
                <p className="text-2xl font-bold text-blue-600">{stats.prepared_week}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor inventario</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.total_inventory_value)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por nombre, marca, SKU..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Categoría */}
            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value, subcategory_id: '', page: 1 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Subcategoría */}
            <select
              value={filters.subcategory_id}
              onChange={(e) => setFilters({ ...filters, subcategory_id: e.target.value, page: 1 })}
              disabled={!filters.category_id}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            >
              <option value="">Todas las subcategorías</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Estado destacado */}
            <select
              value={filters.featured}
              onChange={(e) => setFilters({ ...filters, featured: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los productos</option>
              <option value="true">⭐ Solo destacados</option>
              <option value="false">Sin destacar</option>
            </select>

            {/* Ubicación */}
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="Polanco">Polanco</option>
              <option value="Satélite">Satélite</option>
            </select>

            {/* Ordenamiento */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="featured">Destacados primero</option>
              <option value="inventory_id">Por SKU</option>
            </select>
          </div>

          {/* Selección masiva */}
          {products.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-5 w-5 text-brand-rosa focus:ring-brand-rosa border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Seleccionar todos ({products.length} productos en esta página)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-rosa"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
            No se encontraron productos publicados
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.inventory_id}
                  product={product}
                  isSelected={selectedProducts.includes(product.inventory_id)}
                  onSelect={handleSelectProduct}
                  onEdit={setSelectedProduct}
                />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let page;
                  if (pagination.totalPages <= 5) {
                    page = i + 1;
                  } else if (filters.page <= 3) {
                    page = i + 1;
                  } else if (filters.page >= pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i;
                  } else {
                    page = filters.page - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-3 py-1 rounded ${
                        page === filters.page
                          ? 'bg-brand-rosa text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Mostrando {products.length} de {pagination.total} productos
            </p>
          </>
        )}

        {/* Modal de edición */}
        {selectedProduct && (
          <ProductEditModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSave={handleProductSaved}
          />
        )}

        {/* Barra de acciones masivas */}
        <BulkActionsBar
          selectedCount={selectedProducts.length}
          onFeature={() => handleBulkAction('feature')}
          onUnfeature={() => handleBulkAction('unfeature')}
          onUnpublish={(reason) => handleBulkAction('unpublish', { reason })}
          onCancel={() => setSelectedProducts([])}
        />
      </div>
    </div>
  );
};

// Componente con guardia de autenticación
const ProductManagementWithAuth = () => {
  return (
    <OptionalAuthGuard requireAuth={true} allowedRoles={EMPLOYEE_ROLES}>
      <ProductManagementContent />
    </OptionalAuthGuard>
  );
};

// Componente principal que incluye los providers
const ProductManagement = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductManagementWithAuth />
      </CartProvider>
    </AuthProvider>
  );
};

export default ProductManagement;
