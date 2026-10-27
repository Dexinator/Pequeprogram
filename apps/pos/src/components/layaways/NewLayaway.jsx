import React, { useState } from 'react';
import SearchProducts from '../sales/SearchProducts';
import ClientSelection from '../sales/ClientSelection';
import {
  layawayService,
  formatCurrency,
  depositoSugerido,
  DEPOSITO_PORCENTAJE,
  DEPOSITO_MINIMO
} from '../../services/layaway.service';

const PASOS = [
  { n: 1, titulo: 'Productos' },
  { n: 2, titulo: 'Cliente' },
  { n: 3, titulo: 'Anticipo' },
  { n: 4, titulo: 'Confirmar' }
];

const hoyMas = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};

export default function NewLayaway({ onDone }) {
  const [paso, setPaso] = useState(1);
  const [cart, setCart] = useState([]);
  const [client, setClient] = useState(null);
  const [deposito, setDeposito] = useState('');
  const [metodo, setMetodo] = useState('efectivo');
  const [dueDate, setDueDate] = useState(hoyMas(30));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const total = cart.reduce((sum, i) => sum + i.unit_price * i.quantity_sold, 0);
  const sugerido = depositoSugerido(total);
  const depositoNum = parseFloat(deposito) || 0;
  // Es una referencia, no un requisito: Pablo pidió conservar la flexibilidad
  // de aceptar menos cuando él lo decide.
  const debajoDelSugerido = depositoNum > 0 && depositoNum < sugerido;

  const crear = async () => {
    setSaving(true);
    setError('');
    try {
      const creado = await layawayService.createLayaway({
        client_id: client.id,
        items: cart.map((i) => ({
          inventario_id: i.id,
          quantity: i.quantity_sold,
          unit_price: i.unit_price
        })),
        deposit_amount: depositoNum,
        deposit_method: metodo,
        due_date: dueDate || undefined,
        notes: notes.trim() || undefined
      });
      setDone(creado);
    } catch (err) {
      setError(err?.message || 'No se pudo crear el apartado');
    } finally {
      setSaving(false);
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setCart([]);
    setClient(null);
    setDeposito('');
    setMetodo('efectivo');
    setDueDate(hoyMas(30));
    setNotes('');
    setDone(null);
    setError('');
  };

  if (done) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Apartado registrado</h3>
        <p className="text-gray-600">Apartado #{done.id} para {done.client_name}</p>

        <div className="bg-gray-50 rounded-lg p-4 inline-block text-left space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-gray-600">Total</span>
            <span className="font-medium">{formatCurrency(done.total_amount)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-600">Anticipo</span>
            <span className="font-medium text-green-700">{formatCurrency(done.paid_amount)}</span>
          </div>
          <div className="flex justify-between gap-8 border-t pt-1">
            <span className="text-gray-700 font-medium">Le falta</span>
            <span className="font-bold text-pink-600">{formatCurrency(done.balance_due)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Los artículos ya salieron del inventario disponible.
        </p>

        <div className="flex justify-center space-x-3 pt-2">
          <button onClick={reiniciar} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
            Nuevo apartado
          </button>
          {onDone && (
            <button onClick={onDone} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Ver apartados
            </button>
          )}
        </div>
      </div>
    );
  }

  const puedeAvanzar =
    (paso === 1 && cart.length > 0) ||
    (paso === 2 && Boolean(client)) ||
    paso === 3;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Pasos */}
      <div className="mb-8 flex items-center justify-between">
        {PASOS.map((p, i) => (
          <React.Fragment key={p.n}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paso >= p.n ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {p.n}
              </div>
              <span className={`ml-3 font-medium ${paso >= p.n ? 'text-gray-900' : 'text-gray-500'}`}>
                {p.titulo}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${paso > p.n ? 'bg-pink-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="mb-6">
        {paso === 1 && <SearchProducts cart={cart} setCart={setCart} />}

        {paso === 2 && (
          <>
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
              Un apartado necesita cliente registrado: es a quien se le cobrará el resto
              y a quien se le devolvería el anticipo si se cancela.
            </div>
            <ClientSelection client={client} setClient={setClient} />
          </>
        )}

        {paso === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Anticipo</h3>

            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total del apartado</p>
              <p className="text-2xl font-bold text-pink-600">{formatCurrency(total)}</p>
            </div>

            {/* La referencia que pidió Pablo: 25% con mínimo $100 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Anticipo sugerido ({DEPOSITO_PORCENTAJE * 100}%, mínimo {formatCurrency(DEPOSITO_MINIMO)})
                  </p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(sugerido)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeposito(String(sugerido))}
                  className="px-3 py-1 text-sm border border-pink-300 text-pink-600 rounded hover:bg-pink-50"
                >
                  Usar sugerido
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuánto deja?</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={deposito}
                    onChange={(e) => setDeposito(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={total}
                    className="w-full p-2 pl-8 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                {debajoDelSugerido && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                    Está por debajo del {DEPOSITO_PORCENTAJE * 100}% sugerido ({formatCurrency(sugerido)}),
                    pero puedes continuar si así lo acordaste con el cliente.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Con qué paga?</label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="credito_tienda">Crédito en tienda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si se pasa, el apartado se marca en rojo. No se cancela solo.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded p-4 flex justify-between">
              <span className="text-gray-700">Quedaría a deber</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(Math.max(0, total - depositoNum))}
              </span>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Resumen del apartado</h3>

            <div className="border rounded-lg p-4 space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.description} x{item.quantity_sold}</span>
                  <span>{formatCurrency(item.unit_price * item.quantity_sold)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="border rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente</span>
                <span className="font-medium">{client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Anticipo ({metodo.replace('_', ' ')})</span>
                <span className="font-medium text-green-700">{formatCurrency(depositoNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Le queda a deber</span>
                <span className="font-medium text-pink-600">{formatCurrency(total - depositoNum)}</span>
              </div>
              {dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha límite</span>
                  <span className="font-medium">{dueDate}</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
              Al confirmar, estos artículos <strong>salen del inventario disponible</strong> y ya no
              podrán venderse en mostrador ni en la tienda en línea hasta que se liquide o se cancele.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => (paso === 1 ? reiniciar() : setPaso(paso - 1))}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          {paso === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {paso < 4 ? (
          <button
            onClick={() => setPaso(paso + 1)}
            disabled={!puedeAvanzar}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={crear}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {saving ? 'Registrando…' : 'Registrar apartado'}
          </button>
        )}
      </div>
    </div>
  );
}
