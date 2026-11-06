/**
 * Estado de cuenta del crédito de tienda: HTML para imprimir y texto para
 * WhatsApp.
 *
 * Pablo lo pidió porque los clientes preguntan su saldo seguido y se lo
 * quieren llevar por escrito. Misma estructura que el comprobante de apartado
 * (`layaways/receipt.js`): un solo cuerpo que sirve para la pantalla y para la
 * impresión, así lo que se ve es lo que sale en papel.
 */

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

const fechaHora = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

const fechaCorta = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

/** El saldo es un número vivo: el papel dice a qué momento corresponde. */
function cuerpo(payload) {
  const { business, client, balance, generated_at, movements, movements_truncated } = payload;

  const filas = movements.length
    ? movements
        .map(
          (m) => `
        <tr>
          <td>${esc(fechaCorta(m.date))}</td>
          <td>${esc(m.label)}${m.reason ? `<span class="motivo">${esc(m.reason)}</span>` : ''}</td>
          <td class="num ${Number(m.amount) < 0 ? 'baja' : 'alta'}">${
            Number(m.amount) > 0 ? '+' : ''
          }${money(m.amount)}</td>
          <td class="num">${money(m.balance_after)}</td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="4" class="vacio">Sin movimientos registrados</td></tr>`;

  return `
    <header>
      <h1>${esc(business.name)}</h1>
      <p class="negocio">${esc(business.address)}${business.phone ? ` · Tel. ${esc(business.phone)}` : ''}</p>
      ${business.website ? `<p class="negocio">${esc(business.website)}</p>` : ''}
    </header>

    <h2>Crédito de tienda</h2>

    <table class="datos">
      <tr>
        <td><span class="etq">Cliente</span>${esc(client.name)}${
          client.phone ? ` · ${esc(client.phone)}` : ''
        }</td>
        <td><span class="etq">Al día</span>${esc(fechaHora(generated_at))}</td>
      </tr>
    </table>

    <div class="saldo">
      <p class="etq">Saldo a favor</p>
      <p class="monto">${money(balance)}</p>
    </div>

    <h3>Movimientos${movements_truncated ? ' (los más recientes)' : ''}</h3>
    <table class="items">
      <thead>
        <tr><th>Fecha</th><th>Concepto</th><th class="num">Movimiento</th><th class="num">Saldo</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    ${
      movements_truncated
        ? `<p class="nota">Se muestran los movimientos más recientes. El historial completo está en la tienda.</p>`
        : ''
    }

    <div class="condiciones">
      <p class="titulo">Cómo se usa</p>
      <p>El crédito de tienda se puede usar en cualquier compra en el mostrador. No es canjeable por efectivo.</p>
    </div>

    <footer>
      <p>El saldo cambia con cada compra: este documento refleja el de la fecha y hora indicadas.</p>
    </footer>
  `;
}

const ESTILOS = `
  .estado { font-family: 'Inter', Arial, Helvetica, sans-serif; color: #2d3436; max-width: 620px; margin: 0 auto; font-size: 13px; line-height: 1.45; }
  .estado header { text-align: center; border-bottom: 2px solid #ff6b9d; padding-bottom: 8px; margin-bottom: 12px; }
  .estado h1 { font-size: 20px; margin: 0 0 2px; letter-spacing: .04em; }
  .estado .negocio { margin: 0; font-size: 11px; color: #636e72; }
  .estado h2 { font-size: 15px; text-align: center; margin: 0 0 12px; }
  .estado h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #636e72; margin: 16px 0 4px; }
  .estado table { width: 100%; border-collapse: collapse; }
  .estado .datos td { padding: 3px 0; vertical-align: top; width: 50%; }
  .estado .etq { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #636e72; }
  .estado .saldo { margin: 12px 0 0; padding: 10px 12px; border-radius: 8px; background: #f0fbf6; border: 1px solid #a8e6cf; text-align: center; }
  .estado .saldo .monto { margin: 2px 0 0; font-size: 26px; font-weight: 700; color: #00855f; }
  .estado .items th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #636e72; border-bottom: 1px solid #dfe6e9; padding: 4px 4px 4px 0; }
  .estado .items td { padding: 5px 4px 5px 0; border-bottom: 1px solid #f1f2f6; vertical-align: top; }
  .estado .motivo { display: block; font-size: 10px; color: #636e72; }
  .estado .num { text-align: right; white-space: nowrap; }
  .estado .alta { color: #00855f; font-weight: 600; }
  .estado .baja { color: #c0392b; font-weight: 600; }
  .estado .vacio { color: #636e72; font-style: italic; }
  .estado .nota { margin: 4px 0 0; font-size: 10px; color: #636e72; }
  .estado .condiciones { margin: 14px 0 0; padding: 8px 10px; border: 1px solid #dfe6e9; border-radius: 6px; background: #fafbfc; }
  .estado .condiciones .titulo { margin: 0 0 3px; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #636e72; font-weight: 700; }
  .estado .condiciones p { margin: 0; font-size: 11px; }
  .estado footer { margin-top: 18px; padding-top: 8px; border-top: 1px dashed #b2bec3; text-align: center; font-size: 10px; color: #636e72; }
  .estado footer p { margin: 2px 0; }
`;

/** HTML para incrustar en la previsualización. */
export function statementInnerHtml(payload) {
  return `<style>${ESTILOS}</style><div class="estado">${cuerpo(payload)}</div>`;
}

/** Abre el documento en otra ventana y lanza el diálogo de impresión. */
export function printStatement(payload) {
  const win = window.open('', '_blank', 'width=760,height=900');
  if (!win) return false;

  win.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Crédito de ${esc(payload.client.name)} — ${esc(payload.business.name)}</title>
  <style>
    @page { margin: 12mm; }
    body { margin: 0; }
    ${ESTILOS}
  </style>
</head>
<body>
  <div class="estado">${cuerpo(payload)}</div>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
  return true;
}

/** Resumen en texto para mandar por WhatsApp o mensaje. */
export function statementText(payload) {
  const { business, client, balance, generated_at, movements, movements_truncated } = payload;
  const lineas = [
    `*${business.name}* — Crédito de tienda`,
    '',
    `Cliente: ${client.name}`,
    `*Saldo a favor: ${money(balance)}*`,
    `Al ${fechaHora(generated_at)}`
  ];

  if (movements.length) {
    lineas.push('', movements_truncated ? 'Últimos movimientos:' : 'Movimientos:');
    movements.forEach((m) =>
      lineas.push(
        `• ${fechaCorta(m.date)} — ${m.label}: ${Number(m.amount) > 0 ? '+' : ''}${money(
          m.amount
        )} (saldo ${money(m.balance_after)})`
      )
    );
  }

  lineas.push('', 'El crédito se puede usar en cualquier compra en el mostrador. No es canjeable por efectivo.');

  if (business.address) lineas.push('', business.address);
  if (business.phone) lineas.push(`Tel. ${business.phone}`);

  return lineas.join('\n');
}

/** Link de WhatsApp con el estado de cuenta ya escrito. */
export function whatsappUrl(payload) {
  const digits = String(payload.client?.phone || '').replace(/\D/g, '');
  // Los teléfonos se capturan a 10 dígitos: wa.me necesita la lada de país.
  const numero = digits.length === 10 ? `52${digits}` : digits;
  const texto = encodeURIComponent(statementText(payload));
  return numero ? `https://wa.me/${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
}
