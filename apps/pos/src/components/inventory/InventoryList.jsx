import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import ProductDetailModal from './ProductDetailModal';
import StockUpdateModal from './StockUpdateModal';
import { useAuth } from '../../context/AuthContext';

export default function InventoryList() {
  const authContext = useAuth();
  console.log('🔍 InventoryList - AuthContext completo:', authContext);
  const { user } = authContext;
  console.log('👤 InventoryList - Usuario extraído:', user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    available_only: true,
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stats, setStats] = useState({
    total_items: 0,
    total_quantity: 0,
    total_value: 0,
    by_location: [],
    by_category: []
  });

  // Check if user can edit stock (admin or manager)
  // El rol puede venir como string o como objeto con propiedad 'name'
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
  const allowedRoles = ['superadmin', 'admin', 'manager', 'gerente'];
  const canEditStock = user && allowedRoles.includes(userRole);

  console.log('🎯 InventoryList - Verificación de permisos:', {
    user: user,
    userRole: userRole,
    allowedRoles: allowedRoles,
    roleIncluded: allowedRoles.includes(userRole),
    canEditStock: canEditStock
  });

  // Debug logging
  useEffect(() => {
    console.log('📊 InventoryList useEffect - User:', user);
    console.log('📊 InventoryList useEffect - User role object:', user?.role);
    console.log('📊 InventoryList useEffect - User role string:', userRole);
    console.log('📊 InventoryList useEffect - Can edit stock:', canEditStock);
  }, [user, userRole, canEditStock]);

  // Cargar productos
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.searchInventory(filters);
      setProducts(response.items);
      setPagination({
        total: response.total,
        pages: Math.ceil(response.total / filters.limit)
      });
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await inventoryService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Ver detalle del producto
  const viewProductDetail = async (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Abrir modal de actualización de stock
  const openStockModal = (product) => {
    setStockProduct(product);
    setShowStockModal(true);
  };

  // Actualizar stock del producto
  const handleStockUpdate = async (newQuantity, reason) => {
    if (!stockProduct) return;

    console.log('🔄 Iniciando actualización de stock:', {
      product: stockProduct.id,
      oldQuantity: stockProduct.quantity,
      newQuantity
    });

    try {
      const updatedProduct = await inventoryService.updateQuantity(
        stockProduct.id,
        newQuantity,
        reason
      );

      console.log('✅ Producto actualizado recibido:', updatedProduct);

      if (updatedProduct) {
        // Actualizar el producto en la lista con todos los datos actualizados
        setProducts(prevProducts => {
          const newProducts = prevProducts.map(p =>
            p.id === stockProduct.id
              ? { ...p, quantity: newQuantity } // Usar directamente newQuantity
              : p
          );
          console.log('📋 Lista de productos actualizada');
          return newProducts;
        });

        // Recargar estadísticas
        loadStats();

        // Cerrar modal y limpiar
        setShowStockModal(false);
        setStockProduct(null);

        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`Stock actualizado: ${stockProduct.id} ahora tiene ${newQuantity} unidades`);
        }, 100);
      } else {
        console.error('⚠️ No se recibió producto actualizado del servidor');
        alert('Error: No se recibió confirmación del servidor');
      }
    } catch (error) {
      console.error('❌ Error al actualizar stock:', error);
      alert('Error al actualizar el stock. Por favor, intente nuevamente.');
      throw error;
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      q: '',
      location: '',
      available_only: true,
      page: 1,
      limit: 20
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
        {/* Debug info */}
        <div className="text-sm text-gray-600">
          Usuario: {user?.username || 'No autenticado'} |
          Rol: {userRole || 'Sin rol'} |
          Puede editar: {canEditStock ? 'Sí' : 'No'}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-pink-600">{stats.total_items}</div>
            <div className="text-sm text-gray-600">Productos únicos</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cantidad Total</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600">{stats.total_quantity}</div>
            <div className="text-sm text-gray-600">Unidades en stock</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">
              {inventoryService.formatCurrency(stats.total_value)}
            </div>
            <div className="text-sm text-gray-600">Valor de inventario</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Ubicaciones</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-600">{stats.by_location.length}</div>
            <div className="text-sm text-gray-600">Tiendas activas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Producto
            </label>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              placeholder="ID, categoría, marca, o características..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="Polanco">Polanco</option>
              <option value="Satélite">Satélite</option>
              <option value="Roma">Roma</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mostrar
            </label>
            <select
              value={filters.available_only ? 'available' : 'all'}
              onChange={(e) => handleFilterChange('available_only', e.target.value === 'available')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="available">Solo disponibles</option>
              <option value="all">Todos los productos</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Productos en Inventario</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando inventario...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock {canEditStock && <span className="text-pink-600">(Editable)</span>}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{product.description}</p>
                          {product.valuation_item?.status && (
                            <p className="text-xs text-gray-500">
                              Estado: {inventoryService.getConditionLabel(product.valuation_item.status)}
                            </p>
                          )}
                          {product.id && product.id.startsWith('OTRP') && (
                            <p className="text-xs text-blue-600 font-semibold">
                              Otros Productos
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <p>{product.category_name || 'Sin categoría'}</p>
                          <p className="text-xs">{product.subcategory_name || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.quantity}
                          </span>
                          {/* Botón de edición - TEMPORAL SIEMPRE VISIBLE PARA DEBUG */}
                          <button
                            onClick={() => {
                              console.log('🔴 BOTÓN CLICKEADO - Producto:', product);
                              console.log('🔴 BOTÓN CLICKEADO - Usuario:', user);
                              console.log('🔴 BOTÓN CLICKEADO - canEditStock:', canEditStock);
                              if (!user) {
                                alert('No hay usuario autenticado');
                                return;
                              }
                              if (!canEditStock) {
                                alert(`Tu rol (${userRole}) no tiene permisos para editar stock`);
                                return;
                              }
                              openStockModal(product);
                            }}
                            className={canEditStock
                              ? "px-2 py-1 bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors rounded flex items-center space-x-1"
                              : "px-2 py-1 bg-gray-100 text-gray-400 transition-colors rounded flex items-center space-x-1"
                            }
                            title={canEditStock ? "Editar stock" : `Sin permisos (rol: ${userRole || 'no autenticado'})`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs">
                              {canEditStock ? 'Editar' : 'Sin permisos'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {inventoryService.formatCurrency(product.final_sale_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewProductDetail(product)}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((filters.page - 1) * filters.limit) + 1} a {Math.min(filters.page * filters.limit, pagination.total)} de {pagination.total} resultados
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-lg ${
                          filters.page === page
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle del Producto */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Modal de Actualización de Stock */}
      {showStockModal && stockProduct && (
        <StockUpdateModal
          product={stockProduct}
          currentQuantity={stockProduct.quantity}
          onConfirm={handleStockUpdate}
          onClose={() => {
            setShowStockModal(false);
            setStockProduct(null);
          }}
        />
      )}
    </div>
  );
}