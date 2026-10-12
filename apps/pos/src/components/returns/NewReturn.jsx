import React, { useState } from 'react';
import { returnsService, formatCurrency } from '../../services/returns.service';

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

const METODO_LABEL = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  credito_tienda: 'Crédito en tienda'
};

/**
 * Devolución a partir de un ticket.
 *
 * Los dos tipos solo PROPONEN método y reingreso (garantía → dinero y el
 * artículo no vuelve al inventario; sin defecto → crédito y sí vuelve). La
 * cajera puede cambiar ambas cosas: el sistema no bloquea combinaciones.
 */
export default function NewReturn({ onDone }) {
  const [saleId, setSaleId] = useState('');
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [returnType, setReturnType] = useState('sin_defecto');
  const [refundMethod, setRefundMethod] = useState('credito_tienda');
  const [reason, setReason] = useState('');
  // { [sale_item_id]: { cantidad, restocked, condition_notes } }
  const [selection, setSelection] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const buscar = async (e) => {
    e?.preventDefault();
    const id = parseInt(saleId);
    if (!id) return setError('Escribe el número de ticket');

    setLoading(true);
    setError('');
    setSale(null);
    setSelection({});
    try {
      const data = await returnsService.getSaleForReturn(id);
      setSale(data);
      if (!data.client_id) {
        // Sin cliente registrado no se puede abonar crédito
        setRefundMethod('efectivo');
      }
    } catch (err) {
      setError(err?.message || 'No se encontró esa venta');
    } finally {
      setLoading(false);
    }
  };

  // Al cambiar el tipo se reacomodan los valores propuestos, sin imponerlos
  const cambiarTipo = (tipo) => {
    setReturnType(tipo);
    if (tipo === 'garantia') {
      setRefundMethod('efectivo');
      setSelection((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = { ...next[k], restocked: false }; });
        return next;
      });
    } else {
      if (sale?.client_id) setRefundMethod('credito_tienda');
      setSelection((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = { ...next[k], restocked: true }; });
        return next;
      });
    }
  };

  const toggleItem = (item) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[item.sale_item_id]) {
        delete next[item.sale_item_id];
      } else {
        next[item.sale_item_id] = {
          cantidad: item.quantity_returnable,
          restocked: returnType !== 'garantia',
          condition_notes: ''
        };
      }
      return next;
    });
  };

  const setItemField = (id, field, value) =>
    setSelection((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const seleccionados = sale
    ? sale.items.filter((i) => selection[i.sale_item_id])
    : [];
  const totalDevolver = seleccionados.reduce(
    (sum, i) => sum + i.unit_price * (selection[i.sale_item_id]?.cantidad || 0),
    0
  );

  const confirmar = async () => {
    if (seleccionados.length === 0) return setError('Elige al menos un artículo');

    setSaving(true);
    setError('');
    try {
      const created = await returnsService.createReturn({
        sale_id: sale.sale_id,
        return_type: returnType,
        refund_method: refundMethod,
        reason: reason.trim() || undefined,
        items: seleccionados.map((i) => ({
          sale_item_id: i.sale_item_id,
          quantity_returned: selection[i.sale_item_id].cantidad,
          restocked: selection[i.sale_item_id].restocked,
          condition_notes: selection[i.sale_item_id].condition_notes || undefined
        }))
      });
      setDone(created);
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la devolución');
    } finally {
      setSaving(false);
    }
  };

  const reiniciar = () => {
    setSaleId('');
    setSale(null);
    setSelection({});
    setReason('');
    setDone(null);
    setError('');
    setReturnType('sin_defecto');
    setRefundMethod('credito_tienda');
  };

  // --- Confirmación ---
  if (done) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Devolución registrada</h3>
        <p className="text-gray-600">
          Devolución #{done.id} de la venta #{done.sale_id}
        </p>
        <div className="bg-gray-50 rounded-lg p-4 inline-block text-left">
          <p className="text-sm text-gray-600">
            {done.refund_method === 'efectivo' ? 'Entregar en efectivo' : 'Abonado a su crédito de tienda'}
          </p>
          <p className="text-3xl font-bold text-green-700">{formatCurrency(done.total_amount)}</p>
        </div>
        <div className="flex justify-center space-x-3 pt-2">
          <button onClick={reiniciar} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
            Nueva devolución
          </button>
          {onDone && (
            <button onClick={onDone} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Ver historial
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Buscar ticket */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-1">Devolución de mercancía</h3>
        <p className="text-sm text-gray-600 mb-4">
          Busca el ticket de la venta para traer sus artículos.
        </p>
        <form onSubmit={buscar} className="flex gap-3">
          <input
            type="number"
            value={saleId}
            onChange={(e) => setSaleId(e.target.value)}
            placeholder="Número de ticket (ej. 283)"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300"
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {sale && (
        <>
          {/* Datos de la venta */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Venta #{sale.sale_id}</p>
                <p className="font-medium">{sale.client_name || 'Cliente ocasional'}</p>
                <p className="text-sm text-gray-500">{fecha(sale.sale_date)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total de la venta</p>
                <p className="text-xl font-bold">{formatCurrency(sale.total_amount)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Se pagó con: {sale.payments.map((p) => `${METODO_LABEL[p.payment_method] || p.payment_method} ${formatCurrency(p.amount)}`).join(' · ')}
                </p>
              </div>
            </div>

            {sale.previous_returns.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <span className="font-medium text-amber-900">Esta venta ya tuvo devoluciones: </span>
                {sale.previous_returns.map((r) => `#${r.id} (${formatCurrency(r.total_amount)})`).join(', ')}
              </div>
            )}
          </div>

          {/* Tipo de devolución */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <p className="font-medium text-gray-700">¿Por qué se devuelve?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => cambiarTipo('garantia')}
                className={`p-4 border rounded-lg text-left ${
                  returnType === 'garantia' ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-medium">🛠️ Garantía</p>
                <p className="text-sm text-gray-600">
                  El producto tiene un defecto. Se propone devolver dinero y no regresarlo al inventario.
                </p>
              </button>
              <button
                onClick={() => cambiarTipo('sin_defecto')}
                className={`p-4 border rounded-lg text-left ${
                  returnType === 'sin_defecto' ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className="font-medium">↩️ Sin defecto</p>
                <p className="text-sm text-gray-600">
                  El producto está bien. Se propone crédito de tienda y regresarlo al inventario.
                </p>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo se le devuelve?</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full md:w-72 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="credito_tienda" disabled={!sale.client_id}>
                  Crédito en tienda{!sale.client_id ? ' (requiere cliente registrado)' : ''}
                </option>
              </select>
              {!sale.client_id && (
                <p className="text-xs text-gray-500 mt-1">
                  Esta venta fue a cliente ocasional, así que no hay a quién abonarle crédito.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. llegó con una pieza rota, no le quedó…"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Artículos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b">
              <p className="font-medium text-gray-700">¿Qué se devuelve?</p>
            </div>
            <div className="divide-y divide-gray-200">
              {sale.items.map((item) => {
                const sel = selection[item.sale_item_id];
                const agotado = item.quantity_returnable <= 0;
                return (
                  <div key={item.sale_item_id} className={`p-4 ${agotado ? 'bg-gray-50 text-gray-400' : ''}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(sel)}
                        disabled={agotado}
                        onChange={() => toggleItem(item)}
                        className="mt-1 w-4 h-4 text-pink-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.description}{' '}
                          <span className="font-mono text-sm text-gray-500">({item.inventario_id})</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unit_price)} · vendidos {item.quantity_sold}
                          {item.quantity_returned > 0 && ` · ya devueltos ${item.quantity_returned}`}
                          {agotado && ' · nada por devolver'}
                        </p>

                        {sel && (
                          <div className="mt-3 space-y-2 bg-gray-50 rounded p-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="text-sm text-gray-700">Cantidad:</label>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity_returnable}
                                value={sel.cantidad}
                                onChange={(e) =>
                                  setItemField(
                                    item.sale_item_id,
                                    'cantidad',
                                    Math.min(item.quantity_returnable, Math.max(1, parseInt(e.target.value) || 1))
                                  )
                                }
                                className="w-20 p-1 border border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-500">de {item.quantity_returnable}</span>

                              <label className="flex items-center gap-2 text-sm text-gray-700 ml-auto">
                                <input
                                  type="checkbox"
                                  checked={sel.restocked}
                                  onChange={(e) => setItemField(item.sale_item_id, 'restocked', e.target.checked)}
                                  className="w-4 h-4 text-pink-600 rounded"
                                />
                                Regresa al inventario
                              </label>
                            </div>
                            {!sel.restocked && (
                              <input
                                type="text"
                                value={sel.condition_notes}
                                onChange={(e) => setItemField(item.sale_item_id, 'condition_notes', e.target.value)}
                                placeholder="¿Qué tiene el producto? (opcional)"
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total y confirmación */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Total a devolver</p>
              <p className="text-3xl font-bold text-pink-600">{formatCurrency(totalDevolver)}</p>
              <p className="text-sm text-gray-500">
                {refundMethod === 'efectivo' ? 'Se entrega en efectivo' : 'Se abona a su crédito de tienda'}
              </p>
            </div>
            <button
              onClick={confirmar}
              disabled={saving || seleccionados.length === 0}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Registrando…' : 'Registrar devolución'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
