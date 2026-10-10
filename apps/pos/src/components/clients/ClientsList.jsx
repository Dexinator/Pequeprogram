import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/client.service';
import ClientDetailModal from './ClientDetailModal';
import ClientFormModal from './ClientFormModal';

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const [filters, setFilters] = useState({
    search: '',
    with_credit: false,
    sort_by: 'name',
    sort_dir: 'asc',
    page: 1,
    limit: 20
  });

  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clientService.listClients(filters);
      setClients(res.clients);
      setPagination({ total: res.total, pages: res.pages });
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce del buscador: en mostrador se teclea rápido y no hay por qué
  // pegarle al servidor en cada letra.
  useEffect(() => {
    const t = setTimeout(load, filters.search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = (field, value) => setFilters({ ...filters, [field]: value, page: 1 });

  const toggleSort = (field) => {
    setFilters({
      ...filters,
      sort_by: field,
      sort_dir: filters.sort_by === field && filters.sort_dir === 'asc' ? 'desc' : 'asc',
      page: 1
    });
  };

  const sortArrow = (field) =>
    filters.sort_by === field ? (filters.sort_dir === 'asc' ? ' ▲' : ' ▼') : '';

  // Ventana deslizante de 5 páginas, igual que en inventario
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <p className="text-sm text-gray-600">
            Consulta el histórico de cada cliente, edita sus datos y ajusta su crédito.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Nombre, teléfono o email…"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <label className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              checked={filters.with_credit}
              onChange={(e) => set('with_credit', e.target.checked)}
              className="w-4 h-4 text-pink-600 rounded"
            />
            <span className="text-sm text-gray-700">Solo con crédito a favor</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando clientes…</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filters.search ? `No hay clientes que coincidan con “${filters.search}”.` : 'Aún no hay clientes.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => toggleSort('name')}>
                      Nombre{sortArrow('name')}
                    </th>
                    <th className="px-6 py-3 text-left">Teléfono</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-right cursor-pointer" onClick={() => toggleSort('credit')}>
                      Crédito{sortArrow('credit')}
                    </th>
                    <th className="px-6 py-3 text-left">Notas</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{c.name}</td>
                      <td className="px-6 py-3">{c.phone || '—'}</td>
                      <td className="px-6 py-3 text-gray-600">{c.email || '—'}</td>
                      <td className={`px-6 py-3 text-right font-medium ${Number(c.store_credit) > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {money(c.store_credit)}
                      </td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate" title={c.notes || ''}>
                        {c.notes || '—'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setSelected(c)}
                          className="text-pink-600 hover:text-pink-800 font-medium"
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
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
        <ClientDetailModal
          client={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}

      {showNew && (
        <ClientFormModal
          onClose={() => setShowNew(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
