import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/client.service';
import { SalesService } from '../../services/sales.service';
import { consignmentService } from '../../services/consignment.service';
import AdjustStoreCreditModal from '../modules/AdjustStoreCreditModal';
import ClientFormModal from './ClientFormModal';
import { useAuth } from '../../context/AuthContext';

const salesService = new SalesService();

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

const fecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const MOVEMENT_LABELS = {
  manual_add: 'Carga manual',
  manual_subtract: 'Descuento manual',
  sale_charge: 'Pago con saldo',
  sale_refund: 'Devolución',
  valuation_credit: 'Crédito por valuación',
  initial_load: 'Saldo inicial'
};

const TABS = {
  credito: 'Crédito en tienda',
  compras: 'Compras',
  valuaciones: 'Nos vendió',
  consignaciones: 'Consignaciones',
  apartados: 'Apartados'
};

/**
 * Ficha del cliente: lo que Pablo pidió como "ver cada uno a detalle con su
 * histórico y cambiar sus datos".
 *
 * El encabezado se llena con un solo `summary`; cada pestaña carga su detalle
 * cuando se abre, para no hacer cinco llamadas al abrir la ficha.
 */
export default function ClientDetailModal({ client: initialClient, onClose, onChanged }) {
  const { user } = useAuth() || {};
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
  const canAdjustCredit = ['superadmin', 'admin', 'manager', 'gerente'].includes(userRole);

  const [client, setClient] = useState(initialClient);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('credito');

  const [showEdit, setShowEdit] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);

  // Cada pestaña guarda sus filas y si ya se cargó, para no repedirlas
  const [data, setData] = useState({});
  const [loadingTab, setLoadingTab] = useState(false);

  const reloadClient = async () => {
    const [fresh, sum] = await Promise.all([
      clientService.getClientById(client.id),
      clientService.getClientSummary(client.id)
    ]);
    if (fresh) setClient(fresh);
    if (sum) setSummary(sum);
    if (onChanged) onChanged();
  };

  useEffect(() => {
    clientService.getClientSummary(client.id).then(setSummary).catch(() => setSummary(null));
  }, [client.id]);

  useEffect(() => {
    if (data[tab]) return; // ya cargada

    let cancelled = false;
    const load = async () => {
      setLoadingTab(true);
      try {
        let rows = [];
        if (tab === 'credito') {
          rows = await clientService.getStoreCreditMovements(client.id);
        } else if (tab === 'compras') {
          const res = await salesService.getSales({ client_id: client.id, limit: 50 });
          rows = res.sales || [];
        } else if (tab === 'valuaciones') {
          rows = await loadValuations(client.id);
        } else if (tab === 'consignaciones') {
          const res = await consignmentService.getConsignments({ client_id: client.id, limit: 50 });
          rows = res?.consignments || res?.data || [];
        }
        if (!cancelled) setData((prev) => ({ ...prev, [tab]: rows }));
      } catch {
        if (!cancelled) setData((prev) => ({ ...prev, [tab]: [] }));
      } finally {
        if (!cancelled) setLoadingTab(false);
      }
    };

    if (tab !== 'apartados') load();
    return () => { cancelled = true; };
  }, [tab, client.id, data]);

  const rows = data[tab] || [];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{client.name}</h3>
              <div className="text-sm text-gray-600 mt-1 space-x-3">
                <span>{client.phone || 'Sin teléfono'}</span>
                {client.email && <span>· {client.email}</span>}
                {client.identification && <span>· ID: {client.identification}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">Cliente desde {fecha(client.created_at)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEdit(true)}
                className="px-3 py-1 text-sm border border-pink-300 text-pink-600 rounded hover:bg-pink-50"
              >
                Editar datos
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {client.notes && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
              <span className="font-medium">Notas: </span>
              {client.notes}
            </div>
          )}

          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-gray-600">Crédito en tienda</p>
              <p className="text-lg font-bold text-green-700">
                {money(summary?.store_credit ?? client.store_credit)}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Compras</p>
              <p className="text-lg font-bold text-gray-800">{summary?.purchases_count ?? '—'}</p>
              <p className="text-xs text-gray-500">{money(summary?.purchases_total)}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Nos vendió</p>
              <p className="text-lg font-bold text-gray-800">{summary?.valuations_count ?? '—'}</p>
              <p className="text-xs text-gray-500">{money(summary?.valuations_total)}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Consignaciones</p>
              <p className="text-lg font-bold text-gray-800">{summary?.consignments_count ?? '—'}</p>
              <p className="text-xs text-gray-500">{summary?.consignments_unpaid ?? 0} por pagar</p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex space-x-1 border-b px-6 overflow-x-auto">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                tab === key
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'credito' && canAdjustCredit && (
            <button
              onClick={() => setShowAdjust(true)}
              className="mb-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
            >
              Ajustar saldo
            </button>
          )}

          {tab === 'apartados' ? (
            <p className="text-center text-gray-500 py-6">
              Los apartados se habilitan en una etapa próxima.
            </p>
          ) : loadingTab ? (
            <p className="text-center text-gray-500 py-6">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Sin movimientos en esta sección.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  {tab === 'credito' && (
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Movimiento</th>
                      <th className="px-3 py-2 text-left">Motivo</th>
                      <th className="px-3 py-2 text-right">Importe</th>
                      <th className="px-3 py-2 text-right">Saldo</th>
                    </tr>
                  )}
                  {tab === 'compras' && (
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Venta</th>
                      <th className="px-3 py-2 text-left">Pago</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  )}
                  {tab === 'valuaciones' && (
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Folio</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                    </tr>
                  )}
                  {tab === 'consignaciones' && (
                    <tr>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-right">Precio</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((r, i) => (
                    <tr key={r.id ?? i}>
                      {tab === 'credito' && (
                        <>
                          <td className="px-3 py-2">{fecha(r.created_at)}</td>
                          <td className="px-3 py-2">{MOVEMENT_LABELS[r.movement_type] || r.movement_type}</td>
                          <td className="px-3 py-2 text-gray-600">{r.reason || '—'}</td>
                          <td className={`px-3 py-2 text-right font-medium ${Number(r.amount) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {money(r.amount)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">{money(r.balance_after)}</td>
                        </>
                      )}
                      {tab === 'compras' && (
                        <>
                          <td className="px-3 py-2">{fecha(r.sale_date)}</td>
                          <td className="px-3 py-2">#{r.id}</td>
                          <td className="px-3 py-2 capitalize">{r.payment_method}</td>
                          <td className="px-3 py-2 text-right font-medium">{money(r.total_amount)}</td>
                        </>
                      )}
                      {tab === 'valuaciones' && (
                        <>
                          <td className="px-3 py-2">{fecha(r.valuation_date)}</td>
                          <td className="px-3 py-2">{r.folio || `#${r.id}`}</td>
                          <td className="px-3 py-2">{r.status}</td>
                          <td className="px-3 py-2 text-right font-medium">{money(r.total_purchase_amount)}</td>
                        </>
                      )}
                      {tab === 'consignaciones' && (
                        <>
                          <td className="px-3 py-2 font-mono">{r.inventario_id || r.sku || '—'}</td>
                          <td className="px-3 py-2">{r.subcategory_name || r.description || '—'}</td>
                          <td className="px-3 py-2">{r.consignment_status || r.status || '—'}</td>
                          <td className="px-3 py-2 text-right">{money(r.consignment_price ?? r.final_sale_price)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <ClientFormModal
          client={client}
          onClose={() => setShowEdit(false)}
          onSaved={reloadClient}
        />
      )}

      {showAdjust && (
        <AdjustStoreCreditModal
          client={client}
          onClose={() => setShowAdjust(false)}
          onAdjusted={() => {
            // El saldo cambió: refrescar el encabezado y volver a pedir los
            // movimientos para que el ajuste aparezca en la tabla.
            setData((prev) => ({ ...prev, credito: undefined }));
            reloadClient();
          }}
        />
      )}
    </div>
  );
}

// Las valuaciones no tienen servicio propio en el POS, así que se piden
// directo con el mismo cliente HTTP que usa el resto del módulo.
async function loadValuations(clientId) {
  const { HttpService } = await import('../../services/http.service');
  const http = new HttpService();
  const token = localStorage.getItem('entrepeques_auth_token');
  if (token) http.setAuthToken(token);
  const response = await http.get('/valuations', { client_id: clientId, limit: 50 });
  return response?.data || [];
}
