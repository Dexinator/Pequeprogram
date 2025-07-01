import React, { useState, useEffect } from 'react';
import { consignmentService } from '../../services/consignment.service';

export default function ConsignmentsList() {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    status: 'all',
    location: '',
    client_id: '',
    page: 1,
    limit: 20
  });
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    paid_amount: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    total_items: 0,
    available_items: 0,
    sold_unpaid_items: 0,
    sold_paid_items: 0,
    total_available_value: 0,
    total_unpaid_value: 0,
    total_paid_value: 0,
    total_sold_value: 0
  });

  // Cargar consignaciones
  const loadConsignments = async () => {
    setLoading(true);
    try {
      const response = await consignmentService.getConsignments(filters);
      setConsignments(response.consignments);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error cargando consignaciones:', error);
      alert('Error al cargar las consignaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await consignmentService.getStats();
      console.log('📊 Stats loaded:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadConsignments();
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

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: 'all',
      location: '',
      client_id: '',
      page: 1,
      limit: 20
    });
  };

  // Ver detalle de consignación
  const viewConsignmentDetail = async (consignmentId) => {
    try {
      const consignment = await consignmentService.getConsignment(consignmentId);
      setSelectedConsignment(consignment);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error cargando detalle de consignación:', error);
      alert('Error al cargar el detalle de la consignación');
    }
  };

  // Marcar como pagado
  const markAsPaid = (consignment) => {
    setSelectedConsignment(consignment);
    setPaymentFormData({
      paid_amount: consignment.consignment_price?.toString() || '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  // Confirmar pago
  const confirmPayment = async () => {
    if (!paymentFormData.paid_amount) {
      alert('Por favor ingresa el monto pagado');
      return;
    }

    try {
      await consignmentService.markAsPaid(
        selectedConsignment.id,
        parseFloat(paymentFormData.paid_amount),
        paymentFormData.notes
      );
      
      setShowPaymentModal(false);
      loadConsignments();
      loadStats();
      alert('Consignación marcada como pagada exitosamente');
    } catch (error) {
      console.error('Error marcando como pagado:', error);
      alert('Error al marcar consignación como pagada');
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      sold_unpaid: 'bg-yellow-100 text-yellow-800',
      sold_paid: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      available: 'Disponible',
      sold_unpaid: 'Vendido - Sin Pagar',
      sold_paid: 'Vendido - Pagado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Consignaciones</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-pink-600">{stats.total_items}</div>
            <div className="text-sm text-gray-600">En consignación</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Disponibles</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">{stats.available_items}</div>
            <div className="text-sm text-gray-600">En tienda</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Vendidos Sin Pagar</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-yellow-600">{stats.sold_unpaid_items}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Vendidos Pagados</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600">{stats.sold_paid_items}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pendiente de Pago</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-orange-600">
              {consignmentService.formatCurrency(stats.total_unpaid_value)}
            </div>
            <div className="text-sm text-gray-600">A pagar</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Pagado</h3>
          <div className="mt-2">
            <div className="text-2xl font-bold text-indigo-600">
              {consignmentService.formatCurrency(stats.total_paid_value)}
            </div>
            <div className="text-sm text-gray-600">Ya pagado</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="sold_unpaid">Vendidos Sin Pagar</option>
              <option value="sold_paid">Vendidos Pagados</option>
              <option value="sold">Todos los Vendidos</option>
            </select>
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
              <option value="">Todas</option>
              <option value="Polanco">Polanco</option>
              <option value="Satélite">Satélite</option>
              <option value="Roma">Roma</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Cliente
            </label>
            <input
              type="number"
              placeholder="ID del cliente"
              value={filters.client_id}
              onChange={(e) => handleFilterChange('client_id', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registros por página
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
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

      {/* Lista de Consignaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Productos en Consignación</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando consignaciones...</p>
          </div>
        ) : consignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron productos en consignación
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
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Consignación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
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
                  {consignments.map((consignment) => (
                    <tr key={consignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{consignment.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{consignmentService.getProductDescription(consignment)}</p>
                          <p className="text-gray-500 text-xs">Valuación #{consignment.valuation_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{consignment.client_name}</p>
                          <p className="text-gray-500 text-xs">{consignment.client_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                        {consignmentService.formatCurrency(consignment.consignment_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {consignmentService.formatCurrency(consignment.final_sale_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consignment.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(consignment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewConsignmentDetail(consignment.id)}
                          className="text-pink-600 hover:text-pink-900 mr-3"
                        >
                          Ver
                        </button>
                        {consignment.status === 'sold_unpaid' && (
                          <button
                            onClick={() => markAsPaid(consignment)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Marcar Pagado
                          </button>
                        )}
                        {consignment.status === 'sold_paid' && consignment.consignment_paid_date && (
                          <span className="text-xs text-gray-500">
                            Pagado {consignmentService.formatDate(consignment.consignment_paid_date)}
                          </span>
                        )}
                        {consignment.status === 'available' && (
                          <span className="text-xs text-gray-500">
                            En tienda
                          </span>
                        )}
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
                            ? 'bg-pink-600 text-white border-pink-600'
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
      {showDetailModal && selectedConsignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalle de Consignación #{selectedConsignment.id}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del producto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información del Producto</h4>
                  <p><span className="font-medium">Descripción:</span> {consignmentService.getProductDescription(selectedConsignment)}</p>
                  <p><span className="font-medium">Categoría:</span> {selectedConsignment.category_name}</p>
                  <p><span className="font-medium">Subcategoría:</span> {selectedConsignment.subcategory_name}</p>
                  <p><span className="font-medium">Marca:</span> {selectedConsignment.brand_name}</p>
                  <p><span className="font-medium">Ubicación:</span> {selectedConsignment.location}</p>
                  <p><span className="font-medium">Estado:</span> {getStatusBadge(selectedConsignment.status)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cliente</h4>
                  <p><span className="font-medium">Nombre:</span> {selectedConsignment.client_name}</p>
                  <p><span className="font-medium">Teléfono:</span> {selectedConsignment.client_phone}</p>
                  <p><span className="font-medium">ID Cliente:</span> {selectedConsignment.client_id}</p>
                  <p><span className="font-medium">Valuación:</span> #{selectedConsignment.valuation_id}</p>
                </div>
              </div>
              
              {/* Precios */}
              <div>
                <h4 className="font-medium mb-2">Información de Precios</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p><span className="font-medium">Precio Consignación:</span></p>
                    <p className="text-2xl font-bold text-pink-600">
                      {consignmentService.formatCurrency(selectedConsignment.consignment_price)}
                    </p>
                  </div>
                  <div>
                    <p><span className="font-medium">Precio de Venta:</span></p>
                    <p className="text-2xl font-bold text-green-600">
                      {consignmentService.formatCurrency(selectedConsignment.final_sale_price)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Características específicas */}
              {selectedConsignment.features && Object.keys(selectedConsignment.features).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Características</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedConsignment.features).map(([key, value]) => (
                      <p key={key} className="capitalize">
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Información de venta si está vendido */}
              {(selectedConsignment.status === 'sold_unpaid' || selectedConsignment.status === 'sold_paid') && (
                <div>
                  <h4 className="font-medium mb-2">Información de Venta</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p><span className="font-medium">Fecha de Venta:</span> {consignmentService.formatDate(selectedConsignment.sold_date)}</p>
                    <p><span className="font-medium">ID de Venta:</span> #{selectedConsignment.sale_id}</p>
                    <p><span className="font-medium">Precio de Venta Real:</span> {consignmentService.formatCurrency(selectedConsignment.sale_price)}</p>
                  </div>
                </div>
              )}

              {/* Información de pago si está pagado */}
              {selectedConsignment.status === 'sold_paid' && (
                <div>
                  <h4 className="font-medium mb-2">Información de Pago</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p><span className="font-medium">Fecha de Pago:</span> {consignmentService.formatDate(selectedConsignment.consignment_paid_date)}</p>
                    <p><span className="font-medium">Monto Pagado:</span> {consignmentService.formatCurrency(selectedConsignment.consignment_paid_amount)}</p>
                    {selectedConsignment.consignment_paid_notes && (
                      <p><span className="font-medium">Notas de Pago:</span> {selectedConsignment.consignment_paid_notes}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notas */}
              {selectedConsignment.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notas</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedConsignment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              {selectedConsignment.status === 'sold_unpaid' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    markAsPaid(selectedConsignment);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Marcar como Pagado
                </button>
              )}
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

      {/* Modal de Marcar como Pagado */}
      {showPaymentModal && selectedConsignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Marcar como Pagado</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Producto:</strong> {consignmentService.getProductDescription(selectedConsignment)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Cliente:</strong> {selectedConsignment.client_name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Precio Consignación:</strong> {consignmentService.formatCurrency(selectedConsignment.consignment_price)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Pagado al Proveedor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto pagado"
                  value={paymentFormData.paid_amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paid_amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Normalmente coincide con el precio de consignación
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del Pago (opcional)
                </label>
                <textarea
                  placeholder="Información adicional sobre el pago (método, referencia, etc.)"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}