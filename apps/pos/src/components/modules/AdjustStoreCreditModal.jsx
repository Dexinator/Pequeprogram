import React, { useEffect, useState } from 'react';
import { clientService } from '../../services/client.service';

const formatMoney = (amount) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number(amount) || 0
  );

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const MOVEMENT_LABELS = {
  manual_add: 'Carga manual',
  manual_subtract: 'Descuento manual',
  sale_charge: 'Pago con saldo',
  sale_refund: 'Devolución',
  valuation_credit: 'Crédito por valuación',
  initial_load: 'Saldo inicial',
};

export default function AdjustStoreCreditModal({ client, onClose, onAdjusted }) {
  const [direction, setDirection] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(true);

  useEffect(() => {
    if (!client?.id) return;
    setLoadingMovements(true);
    clientService
      .getStoreCreditMovements(client.id)
      .then(rows => setMovements(rows))
      .catch(() => setMovements([]))
      .finally(() => setLoadingMovements(false));
  }, [client?.id]);

  const currentBalance = Number(client?.store_credit) || 0;
  const numericAmount = parseFloat(amount) || 0;
  const signedAmount = direction === 'add' ? numericAmount : -numericAmount;
  const projectedBalance = currentBalance + signedAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!numericAmount || numericAmount <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }
    if (!reason.trim()) {
      setError('Escribe un motivo para registrar el ajuste.');
      return;
    }
    if (projectedBalance < 0) {
      setError(`El saldo no puede quedar en negativo (resultaría en ${formatMoney(projectedBalance)}).`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await clientService.adjustStoreCredit(
        client.id,
        signedAmount,
        reason.trim(),
        notes.trim() || undefined
      );
      setSuccess(result);
      setAmount('');
      setReason('');
      setNotes('');
      const fresh = await clientService.getStoreCreditMovements(client.id);
      setMovements(fresh);
      if (onAdjusted) onAdjusted(result);
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el ajuste.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Ajustar crédito en tienda</h3>
            <p className="text-sm text-gray-600">{client?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Saldo actual</p>
          <p className="text-2xl font-bold text-gray-800">{formatMoney(currentBalance)}</p>
          {numericAmount > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Saldo después del ajuste:{' '}
              <span className={projectedBalance < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                {formatMoney(projectedBalance)}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setDirection('add')}
              className={`flex-1 py-2 px-3 rounded font-medium ${
                direction === 'add' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Agregar saldo
            </button>
            <button
              type="button"
              onClick={() => setDirection('subtract')}
              className={`flex-1 py-2 px-3 rounded font-medium ${
                direction === 'subtract' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Restar saldo
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto (MXN)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              placeholder="Ej. Saldo migrado del sistema viejo, ajuste por devolución, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
              Ajuste registrado. Saldo nuevo: {formatMoney(success.new_balance)}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando…' : 'Registrar ajuste'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </form>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Historial de movimientos</h4>
          {loadingMovements ? (
            <p className="text-sm text-gray-500">Cargando…</p>
          ) : movements.length === 0 ? (
            <p className="text-sm text-gray-500">Sin movimientos registrados.</p>
          ) : (
            <div className="border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Fecha</th>
                    <th className="px-2 py-1 text-left">Tipo</th>
                    <th className="px-2 py-1 text-right">Monto</th>
                    <th className="px-2 py-1 text-right">Saldo</th>
                    <th className="px-2 py-1 text-left">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map(m => (
                    <tr key={m.id}>
                      <td className="px-2 py-1 whitespace-nowrap">{formatDate(m.created_at)}</td>
                      <td className="px-2 py-1">{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
                      <td className={`px-2 py-1 text-right ${Number(m.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(m.amount) >= 0 ? '+' : ''}{formatMoney(m.amount)}
                      </td>
                      <td className="px-2 py-1 text-right">{formatMoney(m.balance_after)}</td>
                      <td className="px-2 py-1 text-gray-600">{m.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
