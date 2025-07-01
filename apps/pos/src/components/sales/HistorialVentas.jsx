import React, { useState, useEffect } from 'react';
import { SalesService, formatCurrency, formatDate } from '../../services/sales.service';

const salesService = new SalesService();

export default function HistorialVentas() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayAmount: 0,
    weekSales: 0,
    weekAmount: 0,
    averageSale: 0
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    payment_method: '',
    page: 1,
    limit: 20
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSales();
    loadStats();
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await salesService.getSales(filters);
      setSales(response.sales);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await salesService.getSalesStats();
      setStats(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const viewSaleDetails = async (saleId) => {
    try {
      const sale = await salesService.getSaleById(saleId);
      if (sale) {
        setSelectedSale(sale);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Ventas Hoy</p>
          <p className="text-2xl font-bold text-gray-900">{stats.todaySales}</p>
          <p className="text-sm text-green-600">{formatCurrency(stats.todayAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Ventas Semana</p>
          <p className="text-2xl font-bold text-gray-900">{stats.weekSales}</p>
          <p className="text-sm text-green-600">{formatCurrency(stats.weekAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Ticket Promedio</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSale)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Ventas</p>
          <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={filters.payment_method}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                startDate: '',
                endDate: '',
                payment_method: '',
                page: 1,
                limit: 20
              })}
              className="w-full p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
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
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Cargando ventas...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron ventas
                </td>
              </tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.sale_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.client_name || 'Cliente Ocasional'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sale.payment_method === 'efectivo' ? 'bg-green-100 text-green-800' :
                      sale.payment_method === 'tarjeta' ? 'bg-blue-100 text-blue-800' :
                      sale.payment_method === 'transferencia' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewSaleDetails(sale.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Detalle de Venta #{selectedSale.id}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSale(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">{formatDate(selectedSale.sale_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedSale.client_name || 'Cliente Ocasional'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendedor</p>
                  <p className="font-medium">
                    {selectedSale.user?.first_name} {selectedSale.user?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium text-lg text-green-600">
                    {formatCurrency(selectedSale.total_amount)}
                  </p>
                </div>
              </div>

              {/* Productos */}
              {selectedSale.items && selectedSale.items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Productos</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-center">Cantidad</th>
                        <th className="px-3 py-2 text-right">Precio Unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSale.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">{item.inventario_id}</td>
                          <td className="px-3 py-2 text-center">{item.quantity_sold}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Método de pago */}
              {selectedSale.payment_method === 'mixto' && selectedSale.payment_details && (
                <div>
                  <h4 className="font-medium mb-2">Detalles de Pago</h4>
                  <div className="bg-gray-50 p-3 rounded space-y-1">
                    {selectedSale.payment_details.map((detail, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">{detail.payment_method}:</span>
                        <span>{formatCurrency(detail.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}