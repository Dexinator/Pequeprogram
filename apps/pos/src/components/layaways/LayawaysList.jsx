import React, { useState, useEffect } from 'react';
import { layawayService, formatCurrency } from '../../services/layaway.service';
import LayawayDetailModal from './LayawayDetailModal';

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

const ESTADO = {
  active: { label: 'Activo', clase: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Liquidado', clase: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', clase: 'bg-gray-200 text-gray-700' }
};

export default function LayawaysList() {
  const [layaways, setLayaways] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    status: 'active',
    overdue: false,
    search: '',
    page: 1,
    limit: 20
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.overdue) params.overdue = true;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const [res, st] = await Promise.all([
        layawayService.getLayaways(params),
        layawayService.getStats()
      ]);
      setLayaways(res.layaways);
      setPagination({ total: res.total, pages: res.pages });
      setStats(st);
    } catch {
      setLayaways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = (field, value) => setFilters({ ...filters, [field]: value, page: 1 });

  const pageWindow = () => {
    const total = pagination.pages;
    return Array.from({ length: Math.min(5, total) }, (_, i) => {
      if (total <= 5) return i + 1;
      if (filters.page <= 3) return i + 1;
      if (filters.page >= total - 2) return total - 4 + i;
      return filters.page - 2 + i;
    });
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Apartados activos</h3>
            <div className="text-2xl font-bold text-blue-600">{stats.activos}</div>
            {stats.vencidos > 0 && (
              <div className="text-sm text-red-600">{stats.vencidos} vencidos</div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Por cobrar</h3>
            <div className="text-2xl font-bold text-pink-600">{formatCurrency(stats.por_cobrar)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Ya abonado</h3>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.abonado)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Liquidados</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.liquidados}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar cliente</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Nombre o teléfono…"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Activos</option>
              <option value="completed">Liquidados</option>
              <option value="cancelled">Cancelados</option>
              <option value="">Todos</option>
            </select>
          </div>
          <label className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => set('overdue', e.target.checked)}
              className="w-4 h-4 text-pink-600 rounded"
            />
            <span className="text-sm text-gray-700">Solo vencidos</span>
          </label>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando apartados…</div>
        ) : layaways.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay apartados con estos filtros.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Apartado</th>
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Vence</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-right">Abonado</th>
                    <th className="px-6 py-3 text-right">Le falta</th>
                    <th className="px-6 py-3 text-left">Estado</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {layaways.map((l) => (
                    <tr key={l.id} className={l.is_overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-3 font-medium">#{l.id}</td>
                      <td className="px-6 py-3">
                        {l.client_name}
                        {l.client_phone && (
                          <span className="block text-xs text-gray-500">{l.client_phone}</span>
                        )}
                      </td>
                      <td className={`px-6 py-3 ${l.is_overdue ? 'text-red-700 font-medium' : ''}`}>
                        {fecha(l.due_date)}
                        {l.is_overdue && <span className="block text-xs">vencido</span>}
                      </td>
                      <td className="px-6 py-3 text-right">{formatCurrency(l.total_amount)}</td>
                      <td className="px-6 py-3 text-right text-green-700">{formatCurrency(l.paid_amount)}</td>
                      <td className="px-6 py-3 text-right font-medium text-pink-600">
                        {formatCurrency(l.balance_due)}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${ESTADO[l.status]?.clase || ''}`}>
                          {ESTADO[l.status]?.label || l.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setSelected(l)}
                          className="text-pink-600 hover:text-pink-800 font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-700">
                  Mostrando {((filters.page - 1) * filters.limit) + 1} a{' '}
                  {Math.min(filters.page * filters.limit, pagination.total)} de {pagination.total}
                  <span className="ml-2 font-medium text-gray-900">
                    · Página {filters.page} de {pagination.pages}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  {pageWindow().map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-3 py-1 border rounded-lg ${
                        filters.page === page
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
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

      {selected && (
        <LayawayDetailModal
          layaway={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
