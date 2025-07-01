import React, { useState, useEffect } from 'react';
import { otherProdsService } from '../../services/otherprods.service';
import PurchaseDetailModal from './PurchaseDetailModal';

export default function PurchasesList({ refreshTrigger }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    supplier_name: '',
    location: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total_purchases: 0,
    total_amount: 0,
    total_items: 0,
    purchases_today: 0,
    amount_today: 0,
    purchases_week: 0,
    amount_week: 0,
    top_products: []
  });

  // Cargar compras
  const loadPurchases = async () => {
    setLoading(true);
    try {
      const response = await otherProdsService.getPurchases(filters);
      setPurchases(response.purchases);
      setPagination({
        total: response.total,
        pages: Math.ceil(response.total / filters.limit)
      });
    } catch (error) {
      console.error('Error al cargar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await otherProdsService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [filters, refreshTrigger]);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  // Manejar cambio de filtros
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Ver detalle de compra
  const viewPurchaseDetail = async (purchase) => {
    try {
      const fullPurchase = await otherProdsService.getPurchase(purchase.id);
      setSelectedPurchase(fullPurchase);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de compra:', error);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      supplier_name: '',
      location: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 20
    });
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Compras</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-pink-600">{stats.total_purchases}</div>
            <div className="text-sm text-gray-600">Compras totales</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Monto Total</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">
              {otherProdsService.formatCurrency(stats.total_amount)}
            </div>
            <div className="text-sm text-gray-600">Invertido</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Compras Hoy</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600">{stats.purchases_today}</div>
            <div className="text-sm text-gray-600">
              {otherProdsService.formatCurrency(stats.amount_today)}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Esta Semana</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-600">{stats.purchases_week}</div>
            <div className="text-sm text-gray-600">
              {otherProdsService.formatCurrency(stats.amount_week)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Productos */}
      {stats.top_products.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Productos Más Comprados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.top_products.map((product, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-900">{product.product_name}</p>
                <p className="text-sm text-gray-600">Cantidad: {product.total_quantity}</p>
                <p className="text-sm text-gray-600">
                  Valor: {otherProdsService.formatCurrency(product.total_revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              value={filters.supplier_name}
              onChange={(e) => handleFilterChange('supplier_name', e.target.value)}
              placeholder="Buscar por proveedor"
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
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Lista de Compras */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Historial de Compras</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando compras...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron compras
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
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
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
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{purchase.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {otherProdsService.formatDate(purchase.purchase_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {purchase.supplier_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{purchase.items_count || 0}</span> productos
                        <br />
                        <span className="text-xs">({purchase.total_quantity || 0} unidades)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {otherProdsService.formatCurrency(purchase.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="capitalize">{purchase.payment_method}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewPurchaseDetail(purchase)}
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

      {/* Modal de Detalle */}
      {showDetailModal && selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}