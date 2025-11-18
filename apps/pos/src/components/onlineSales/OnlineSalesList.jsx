import React, { useState, useEffect } from 'react';
import { onlineSalesService } from '../../services/onlineSales.service';
import OnlineSaleDetailModal from './OnlineSaleDetailModal';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazado';
    default:
      return status;
  }
};

export default function OnlineSalesList() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    customerEmail: '',
    page: 1,
    limit: 20
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await onlineSalesService.listOnlineSales(filters);
      setSales(response.sales);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar ventas online:', error);
      alert('Error al cargar ventas online: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewSaleDetails = async (saleId) => {
    try {
      const sale = await onlineSalesService.getOnlineSaleById(saleId);
      if (sale) {
        setSelectedSale(sale);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
      alert('Error al cargar detalles: ' + error.message);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      customerEmail: '',
      page: 1,
      limit: 20
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Pedidos</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Página Actual</p>
          <p className="text-2xl font-bold text-gray-900">
            {pagination.page} / {pagination.totalPages}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pedidos en Página</p>
          <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Cliente
            </label>
            <input
              type="text"
              placeholder="Buscar por email..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.customerEmail}
              onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Pago
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Envío
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron pedidos online
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{sale.id}</div>
                      <div className="text-xs text-gray-500">{sale.payment_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{sale.customer_name}</div>
                      <div className="text-xs text-gray-500">{sale.customer_email}</div>
                      {sale.customer_phone && (
                        <div className="text-xs text-gray-500">{sale.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.payment_date)}
                    </td>
                    <td className="px-4 py-3">
                      {sale.delivery_method === 'pickup' ? (
                        // RECOGER EN TIENDA
                        <div>
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-1">
                            🏪 RECOGER EN TIENDA
                          </div>
                          <div className="text-sm text-gray-900">Polanco, CDMX</div>
                          <div className="text-xs text-green-600 font-medium">
                            Envío: Gratis
                          </div>
                        </div>
                      ) : (
                        // ENVÍO A DOMICILIO
                        <div>
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-1">
                            🚚 ENVÍO A DOMICILIO
                          </div>
                          <div className="text-sm text-gray-900">
                            {sale.shipping_city}, {sale.shipping_state}
                          </div>
                          <div className="text-xs text-gray-500">
                            CP: {sale.shipping_postal_code}
                          </div>
                          {sale.zone_name && (
                            <div className="text-xs text-blue-600">
                              {sale.zone_name} - {formatCurrency(sale.shipping_cost)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sale.items && Array.isArray(sale.items)
                          ? `${sale.items.length} producto(s)`
                          : '0 productos'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(sale.payment_status)}`}>
                        {getStatusText(sale.payment_status)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{sale.payment_method}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewSaleDetails(sale.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando página {pagination.page} de {pagination.totalPages} (Total: {pagination.total} pedidos)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showModal && selectedSale && (
        <OnlineSaleDetailModal
          sale={selectedSale}
          onClose={() => {
            setShowModal(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
}
