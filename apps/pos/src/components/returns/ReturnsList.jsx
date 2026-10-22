import React, { useState, useEffect } from 'react';
import { returnsService, formatCurrency } from '../../services/returns.service';

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        dateStyle: 'short',
        timeStyle: 'short'
      })
    : '—';

const TIPO = { garantia: 'Garantía', sin_defecto: 'Sin defecto' };
const METODO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', credito_tienda: 'Crédito en tienda' };

export default function ReturnsList() {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    return_type: '',
    refund_method: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 20
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
      );
      const [res, st] = await Promise.all([
        returnsService.getReturns(params),
        returnsService.getStats()
      ]);
      setReturns(res.returns);
      setPagination({ total: res.total, pages: res.pages });
      setStats(st);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = (field, value) => setFilters({ ...filters, [field]: value, page: 1 });

  const verDetalle = async (id) => {
    try {
      setDetail(await returnsService.getReturnById(id));
    } catch {
      setDetail(null);
    }
  };

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
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Devoluciones</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.total_returns}</div>
            <div className="text-sm text-gray-600">{stats.este_mes} este mes</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total devuelto</h3>
            <div className="text-2xl font-bold text-pink-600">{formatCurrency(stats.total_amount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">En efectivo</h3>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_cash)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">En tarjeta</h3>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total_card)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">En crédito</h3>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_credit)}</div>
            <div className="text-sm text-gray-600">{stats.garantias} por garantía</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <select
              value={filters.return_type}
              onChange={(e) => set('return_type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option value="garantia">Garantía</option>
              <option value="sin_defecto">Sin defecto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Se devolvió en</label>
            <select
              value={filters.refund_method}
              onChange={(e) => set('refund_method', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="credito_tienda">Crédito en tienda</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando devoluciones…</div>
        ) : returns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aún no hay devoluciones registradas.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Fecha</th>
                    <th className="px-6 py-3 text-left">Devolución</th>
                    <th className="px-6 py-3 text-left">Venta</th>
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Motivo</th>
                    <th className="px-6 py-3 text-left">Devuelto en</th>
                    <th className="px-6 py-3 text-right">Importe</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{fecha(r.return_date)}</td>
                      <td className="px-6 py-3 font-medium">#{r.id}</td>
                      <td className="px-6 py-3">#{r.sale_id}</td>
                      <td className="px-6 py-3">{r.client_name || 'Ocasional'}</td>
                      <td className="px-6 py-3">
                        <span className={r.return_type === 'garantia' ? 'text-amber-700' : 'text-gray-700'}>
                          {TIPO[r.return_type] || r.return_type}
                        </span>
                      </td>
                      <td className="px-6 py-3">{METODO[r.refund_method] || r.refund_method}</td>
                      <td className="px-6 py-3 text-right font-medium">{formatCurrency(r.total_amount)}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => verDetalle(r.id)}
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

      {/* Detalle */}
      {detail && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Devolución #{detail.id}</h3>
                <p className="text-sm text-gray-600">
                  De la venta #{detail.sale_id} · {fecha(detail.return_date)}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Cliente</p>
                  <p className="font-medium">{detail.client_name || 'Ocasional'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Atendió</p>
                  <p className="font-medium">{detail.user_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Motivo</p>
                  <p className="font-medium">{TIPO[detail.return_type] || detail.return_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Devuelto en</p>
                  <p className="font-medium">{METODO[detail.refund_method] || detail.refund_method}</p>
                </div>
              </div>

              {detail.reason && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <span className="text-gray-600">Razón: </span>
                  {detail.reason}
                </div>
              )}

              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-left">Inventario</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(detail.items || []).map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">
                        {it.description}
                        <span className="block font-mono text-xs text-gray-500">{it.inventario_id}</span>
                        {it.condition_notes && (
                          <span className="block text-xs text-amber-700">{it.condition_notes}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{it.quantity_returned}</td>
                      <td className="px-3 py-2">
                        {it.restocked ? (
                          <span className="text-green-700">Regresó</span>
                        ) : (
                          <span className="text-gray-500">No regresó</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(it.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 font-medium">
                  <tr>
                    <td className="px-3 py-2" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right text-pink-600">{formatCurrency(detail.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
