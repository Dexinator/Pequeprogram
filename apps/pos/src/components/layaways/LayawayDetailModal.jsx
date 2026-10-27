import React, { useState } from 'react';
import { layawayService, formatCurrency } from '../../services/layaway.service';
import { useAuth } from '../../context/AuthContext';

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

const METODO = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  credito_tienda: 'Crédito en tienda'
};

const DESTINO_ANTICIPO = {
  efectivo: 'Se devolvió en efectivo',
  credito_tienda: 'Se pasó a crédito de tienda',
  forfeited: 'Se quedó la tienda'
};

export default function LayawayDetailModal({ layaway: inicial, onClose, onChanged }) {
  const { user } = useAuth() || {};
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name || '';
  const puedeCancelar = ['superadmin', 'admin', 'manager', 'gerente'].includes(userRole);

  const [layaway, setLayaway] = useState(inicial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [abono, setAbono] = useState('');
  const [metodo, setMetodo] = useState('efectivo');
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const [destinoAnticipo, setDestinoAnticipo] = useState('credito_tienda');
  const [motivo, setMotivo] = useState('');

  const activo = layaway.status === 'active';
  const resta = layaway.balance_due ?? layaway.total_amount - layaway.paid_amount;

  const refrescar = async () => {
    const fresh = await layawayService.getLayawayById(layaway.id);
    setLayaway(fresh);
    if (onChanged) onChanged();
  };

  const registrarAbono = async () => {
    const monto = parseFloat(abono) || 0;
    if (monto <= 0) return setError('El abono debe ser mayor a cero');

    setSaving(true);
    setError('');
    try {
      const actualizado = await layawayService.addPayment(layaway.id, {
        amount: monto,
        payment_method: metodo
      });
      setLayaway(actualizado);
      setAbono('');
      if (onChanged) onChanged();
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el abono');
    } finally {
      setSaving(false);
    }
  };

  const cancelar = async () => {
    setSaving(true);
    setError('');
    try {
      const actualizado = await layawayService.cancelLayaway(layaway.id, {
        refund_method: destinoAnticipo,
        reason: motivo.trim() || undefined
      });
      setLayaway(actualizado);
      setMostrarCancelar(false);
      if (onChanged) onChanged();
    } catch (err) {
      setError(err?.message || 'No se pudo cancelar el apartado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">Apartado #{layaway.id}</h3>
              <p className="text-sm text-gray-600">
                {layaway.client_name}
                {layaway.client_phone && ` · ${layaway.client_phone}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Creado el {fecha(layaway.created_at)}
                {layaway.due_date && ` · Vence el ${fecha(layaway.due_date)}`}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estado */}
          <div className="mt-3">
            {layaway.status === 'completed' && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Liquidado{layaway.sale_id && ` · se convirtió en la venta #${layaway.sale_id}`}
              </span>
            )}
            {layaway.status === 'cancelled' && (
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                Cancelado · {DESTINO_ANTICIPO[layaway.cancel_refund_method] || 'anticipo sin registrar'}
              </span>
            )}
            {activo && layaway.is_overdue && (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Vencido desde el {fecha(layaway.due_date)}
              </span>
            )}
            {activo && !layaway.is_overdue && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Activo
              </span>
            )}
          </div>

          {/* Importes */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg font-bold">{formatCurrency(layaway.total_amount)}</p>
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-gray-600">Lleva pagado</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(layaway.paid_amount)}</p>
            </div>
            <div className={`rounded p-3 ${resta > 0 ? 'bg-pink-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-600">Le falta</p>
              <p className={`text-lg font-bold ${resta > 0 ? 'text-pink-600' : 'text-gray-500'}`}>
                {formatCurrency(resta)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}

          {/* Abonar */}
          {activo && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-3">Registrar abono</p>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Monto</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={abono}
                      onChange={(e) => setAbono(e.target.value)}
                      step="0.01"
                      min="0"
                      max={resta}
                      className="w-36 p-2 pl-8 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Método</label>
                  <select
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="credito_tienda">Crédito en tienda</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setAbono(String(resta))}
                  className="px-3 py-2 text-sm border border-pink-300 text-pink-600 rounded hover:bg-pink-50"
                >
                  Liquidar todo ({formatCurrency(resta)})
                </button>
                <button
                  onClick={registrarAbono}
                  disabled={saving}
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300"
                >
                  {saving ? 'Guardando…' : 'Abonar'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Si el abono cubre lo que falta, el apartado se liquida y se convierte en venta.
              </p>
            </div>
          )}

          {/* Artículos */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Artículos apartados</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(layaway.items || []).map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">
                        {it.description}
                        <span className="block font-mono text-xs text-gray-500">{it.inventario_id}</span>
                      </td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(it.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(it.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Abonos */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Abonos</p>
            {(layaway.payments || []).length === 0 ? (
              <p className="text-sm text-gray-500">Sin abonos registrados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Método</th>
                    <th className="px-3 py-2 text-left">Quién</th>
                    <th className="px-3 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {layaway.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">{fecha(p.created_at)}</td>
                      <td className="px-3 py-2">{METODO[p.payment_method] || p.payment_method}</td>
                      <td className="px-3 py-2 text-gray-600">{p.user_name || '—'}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {layaway.notes && (
            <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">
              <span className="text-gray-600">Notas: </span>
              {layaway.notes}
            </div>
          )}

          {/* Cancelar */}
          {activo && puedeCancelar && (
            <div className="border-t pt-4">
              {!mostrarCancelar ? (
                <button
                  onClick={() => setMostrarCancelar(true)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancelar este apartado
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <p className="font-medium text-red-900">Cancelar el apartado</p>
                  <p className="text-sm text-red-800">
                    Los artículos regresarán al inventario disponible.
                    {layaway.paid_amount > 0 && (
                      <> El cliente lleva abonado <strong>{formatCurrency(layaway.paid_amount)}</strong>: decide qué pasa con ese dinero.</>
                    )}
                  </p>

                  {layaway.paid_amount > 0 && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">¿Qué pasa con lo abonado?</label>
                      <select
                        value={destinoAnticipo}
                        onChange={(e) => setDestinoAnticipo(e.target.value)}
                        className="w-full md:w-80 p-2 border border-gray-300 rounded"
                      >
                        <option value="credito_tienda">Pasarlo a su crédito de tienda</option>
                        <option value="efectivo">Devolverlo en efectivo</option>
                        <option value="forfeited">Se queda la tienda</option>
                      </select>
                    </div>
                  )}

                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo de la cancelación"
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setMostrarCancelar(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-white"
                    >
                      No cancelar
                    </button>
                    <button
                      onClick={cancelar}
                      disabled={saving}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                    >
                      {saving ? 'Cancelando…' : 'Sí, cancelar apartado'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
