import React, { useState } from 'react';
import { clientService } from '../../services/client.service';

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

/**
 * Alta y edición de cliente con el mismo formulario: si llega `client` edita,
 * si no, da de alta. El teléfono es obligatorio porque la columna es NOT NULL
 * en la base y porque es la llave con la que se busca a la gente en mostrador.
 */
export default function ClientFormModal({ client, onClose, onSaved }) {
  const isEdit = Boolean(client?.id);

  const [form, setForm] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    identification: client?.identification || '',
    notes: client?.notes || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Cliente existente con el mismo teléfono (409 del API)
  const [duplicate, setDuplicate] = useState(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicate(null);

    if (!form.name.trim()) return setError('El nombre es requerido');
    if (!form.phone.trim()) return setError('El teléfono es requerido');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        identification: form.identification.trim() || undefined,
        notes: form.notes
      };

      const saved = isEdit
        ? await clientService.updateClient(client.id, payload)
        : await clientService.createClient(payload);

      if (saved && onSaved) onSaved(saved);
      if (onClose) onClose();
    } catch (err) {
      if (err.code === 'PHONE_EXISTS' && err.data) setDuplicate(err.data);
      setError(err.message || 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
            {error}
            {duplicate && (
              <div className="mt-2 text-xs">
                Saldo de ese cliente: {money(duplicate.store_credit)}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="10 dígitos"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
            <input
              type="text"
              value={form.identification}
              onChange={set('identification')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="Preferencias, acuerdos, avisos…"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-300"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Dar de alta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
