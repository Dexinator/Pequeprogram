import React, { useState, useEffect } from 'react';
import { salesService } from '../services/sales.service';

const HistorialVentas = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_method: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 10
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    todayTotal: 0,
    todayCount: 0,
    weekTotal: 0,
    weekCount: 0
  });

  // Cargar ventas
  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await salesService.getSales(filters);
      setSales(response.sales);
      setPagination(response.pagination);
      
      // Calcular estadísticas básicas
      calculateStats(response.sales);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      alert('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (salesData) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const todaySales = salesData.filter(sale => 
      new Date(sale.sale_date) >= startOfDay && sale.status === 'completed'
    );
    
    const weekSales = salesData.filter(sale => 
      new Date(sale.sale_date) >= startOfWeek && sale.status === 'completed'
    );

    const todayTotal = todaySales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_amount) || 0;
      return sum + amount;
    }, 0);

    const weekTotal = weekSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_amount) || 0;
      return sum + amount;
    }, 0);

    setStats({
      todayTotal,
      todayCount: todaySales.length,
      weekTotal,
      weekCount: weekSales.length
    });
  };

  // Cargar ventas al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadSales();
  }, [filters]);

  // Manejar cambio de filtros
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      payment_method: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 10
    });
  };

  // Ver detalle de venta
  const viewSaleDetail = async (saleId) => {
    try {
      const sale = await salesService.getSale(saleId);
      setSelectedSale(sale);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error cargando detalle de venta:', error);
      alert('Error al cargar el detalle de la venta');
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      completed: 'Completada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Ventas Hoy</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600">{stats.todayCount}</div>
            <div className="text-sm text-gray-600">{salesService.formatCurrency(stats.todayTotal)}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Ventas Esta Semana</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">{stats.weekCount}</div>
            <div className="text-sm text-gray-600">{salesService.formatCurrency(stats.weekTotal)}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Promedio por Venta</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-600">
              {salesService.formatCurrency(stats.todayCount > 0 ? stats.todayTotal / stats.todayCount : 0)}
            </div>
            <div className="text-sm text-gray-600">Hoy</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Ventas</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-orange-600">{pagination.total}</div>
            <div className="text-sm text-gray-600">Registradas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="ID, cliente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="refunded">Reembolsada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={filters.payment_method}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registros por página
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Lista de Ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Historial de Ventas</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando ventas...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron ventas
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
                      Cliente
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
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salesService.formatDate(sale.sale_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.client?.name || sale.client_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.items_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {salesService.formatCurrency(sale.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {sale.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewSaleDetail(sale.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Ver
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
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
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
                          pagination.page === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
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
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalle de Venta #{selectedSale.id}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información de la Venta</h4>
                  <p><span className="font-medium">Fecha:</span> {salesService.formatDate(selectedSale.sale_date)}</p>
                  <p><span className="font-medium">Total:</span> {salesService.formatCurrency(selectedSale.total_amount)}</p>
                  <p><span className="font-medium">Método de Pago:</span> {selectedSale.payment_method}</p>
                  
                  {/* Mostrar detalles de pago si es mixto */}
                  {selectedSale.payment_method === 'mixto' && selectedSale.payment_details && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-600">Desglose:</span>
                      <ul className="text-sm text-gray-600 ml-2">
                        {selectedSale.payment_details.map((payment, index) => (
                          <li key={index}>
                            • {payment.payment_method}: {salesService.formatCurrency(payment.amount)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p><span className="font-medium">Estado:</span> {getStatusBadge(selectedSale.status)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cliente</h4>
                  <p><span className="font-medium">Nombre:</span> {selectedSale.client?.name || selectedSale.client_name}</p>
                  {selectedSale.client && (
                    <>
                      <p><span className="font-medium">Teléfono:</span> {selectedSale.client.phone}</p>
                      {selectedSale.client.email && (
                        <p><span className="font-medium">Email:</span> {selectedSale.client.email}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Items vendidos */}
              <div>
                <h4 className="font-medium mb-2">Productos Vendidos</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSale.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{salesService.getProductDescription({ 
                                id: item.inventario_id, 
                                valuation_item: item.product_info 
                              })}</p>
                              <p className="text-sm text-gray-600">ID: {item.inventario_id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantity_sold}</td>
                          <td className="px-4 py-2 text-sm">{salesService.formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-2 text-sm font-medium">{salesService.formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Notas */}
              {selectedSale.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notas</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedSale.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Imprimir
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialVentas;