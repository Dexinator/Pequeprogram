import React, { useState, useEffect } from 'react';
import { onlineSalesService } from '../../services/onlineSales.service';

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
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

export default function OnlineSalesStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await onlineSalesService.getOnlineSalesStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar estadísticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
        <button
          onClick={loadStats}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total de Ventas Aprobadas</p>
          <p className="text-3xl font-bold">
            {stats.totalSales?.total_sales || 0}
          </p>
          <p className="text-sm opacity-90 mt-2">
            Ingresos: {formatCurrency(stats.totalSales?.total_revenue || 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-1">Ticket Promedio</p>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.totalSales?.average_sale || 0)}
          </p>
          <p className="text-sm opacity-90 mt-2">Por venta aprobada</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-1">Estados de Pago</p>
          <div className="mt-2 space-y-1">
            {stats.salesByStatus?.map((status) => (
              <div key={status.payment_status} className="flex justify-between text-sm">
                <span className="capitalize">{status.payment_status}:</span>
                <span className="font-semibold">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ventas Recientes (últimos 7 días) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ventas de los Últimos 7 Días
        </h3>
        {stats.recentSales && stats.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ventas
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentSales.map((day) => (
                  <tr key={day.date}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {day.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-semibold">
                      {formatCurrency(day.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay ventas en los últimos 7 días
          </p>
        )}
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Productos Más Vendidos
        </h3>
        {stats.topProducts && stats.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad Vendida
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topProducts.map((product, index) => (
                  <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}.`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {product.subcategory_name} {product.brand_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {product.total_quantity} unidades
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-semibold">
                      {formatCurrency(product.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay productos vendidos aún
          </p>
        )}
      </div>

      {/* Zonas de Envío Más Comunes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Zonas de Envío Más Comunes
        </h3>
        {stats.topShippingZones && stats.topShippingZones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.topShippingZones.map((zone) => (
              <div
                key={zone.zone_code}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <p className="text-sm text-gray-600 mb-1">
                  {zone.zone_name || 'Sin zona'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {zone.count}
                </p>
                <p className="text-xs text-gray-500 mt-1">envíos</p>
                <p className="text-sm text-blue-600 font-medium mt-2">
                  {formatCurrency(zone.total_shipping_revenue || 0)}
                </p>
                <p className="text-xs text-gray-500">en envíos</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay datos de zonas de envío
          </p>
        )}
      </div>

      {/* Botón de Actualizar */}
      <div className="flex justify-center">
        <button
          onClick={loadStats}
          className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
}
