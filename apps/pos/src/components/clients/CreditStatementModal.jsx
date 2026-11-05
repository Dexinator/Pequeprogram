import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/client.service';
import { statementInnerHtml, printStatement, statementText, whatsappUrl } from './creditStatement';

/**
 * Estado de cuenta del crédito de tienda: se ve en pantalla, se imprime y se
 * manda por WhatsApp o mensaje.
 *
 * Lo pidió Pablo porque los clientes preguntan su saldo con frecuencia y
 * quieren llevárselo por escrito. El contenido lo arma el API
 * (`/clients/:id/credit-statement`) con el mismo encabezado del ticket.
 */
export default function CreditStatementModal({ clientId, onClose }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    clientService
      .getCreditStatement(clientId)
      .then((p) => vivo && setPayload(p))
      .catch((err) => vivo && setError(err?.message || 'No se pudo cargar el estado de cuenta'));
    return () => {
      vivo = false;
    };
  }, [clientId]);

  const imprimir = () => {
    if (!printStatement(payload)) {
      setError(
        'El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes de este sitio e intenta de nuevo.'
      );
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(statementText(payload));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setError('No se pudo copiar. Selecciona el texto manualmente o usa Imprimir.');
    }
  };

  const telefono = payload?.client?.phone;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Crédito de tienda{payload ? ` · ${payload.client.name}` : ''}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {!payload && !error && (
            <p className="text-center text-gray-500 py-8">Cargando estado de cuenta…</p>
          )}

          {payload && (
            <div className="bg-white p-6 shadow-sm rounded">
              <div dangerouslySetInnerHTML={{ __html: statementInnerHtml(payload) }} />
            </div>
          )}
        </div>

        {payload && (
          <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              En el diálogo de impresión puedes elegir «Guardar como PDF» si lo quieres enviar como archivo.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copiar}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                {copiado ? '¡Texto copiado!' : 'Copiar texto'}
              </button>
              <a
                href={whatsappUrl(payload)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                title={
                  telefono
                    ? `Enviar a ${telefono}`
                    : 'El cliente no tiene teléfono registrado: elige el contacto en WhatsApp'
                }
              >
                {telefono ? 'Enviar por WhatsApp' : 'WhatsApp…'}
              </a>
              <button
                onClick={imprimir}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm font-medium"
              >
                Imprimir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
