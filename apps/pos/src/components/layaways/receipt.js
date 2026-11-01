/**
 * Comprobante de apartado: HTML para imprimir y texto para WhatsApp.
 *
 * Pablo lo pidió para entregarlo al cliente o mandárselo. El HTML es uno solo:
 * la previsualización en pantalla y la ventana de impresión usan la misma
 * función, para que lo que se ve sea lo que sale impreso.
 */

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

const fecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '—';

/**
 * Fechas que en la base son DATE (sin hora), como la fecha límite.
 * Llegan a medianoche UTC, así que convertirlas al horario de México las
 * corre un día hacia atrás: hay que leerlas en UTC.
 */
const fechaDia = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '—';

const fechaHora = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

const ESTADO = {
  active: 'Apartado vigente',
  completed: 'Liquidado',
  cancelled: 'Cancelado'
};

/** Cuerpo del comprobante, sin <html> ni estilos: lo comparten pantalla e impresión. */
function cuerpo(payload) {
  const { business, layaway, client, items, totals, payments } = payload;

  const filas = items
    .map(
      (it) => `
      <tr>
        <td class="sku">${esc(it.sku)}</td>
        <td>${esc(it.description)}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${money(it.unit_price)}</td>
        <td class="num">${money(it.total)}</td>
      </tr>`
    )
    .join('');

  const abonos = payments.length
    ? payments
        .map(
          (p) => `
        <tr>
          <td>${esc(fechaHora(p.date))}</td>
          <td>${esc(p.label)}</td>
          <td class="num">${money(p.amount)}</td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="3" class="vacio">Sin abonos registrados</td></tr>`;

  const aviso =
    layaway.status === 'cancelled'
      ? `<p class="aviso cancelado">Este apartado fue cancelado.</p>`
      : layaway.is_overdue
      ? `<p class="aviso vencido">La fecha límite de este apartado ya pasó. Preséntate en la tienda para ponerlo al día.</p>`
      : totals.balance_due <= 0
      ? `<p class="aviso pagado">Apartado liquidado. ¡Gracias por tu compra!</p>`
      : layaway.due_date
      ? `<p class="aviso">Tienes hasta el <strong>${esc(fechaDia(layaway.due_date))}</strong> para liquidar este apartado.</p>`
      : '';

  return `
    <header>
      <h1>${esc(business.name)}</h1>
      <p class="negocio">${esc(business.address)}${business.phone ? ` · Tel. ${esc(business.phone)}` : ''}</p>
      ${business.website ? `<p class="negocio">${esc(business.website)}</p>` : ''}
    </header>

    <h2>Comprobante de apartado #${layaway.id}</h2>

    <table class="datos">
      <tr>
        <td><span class="etq">Fecha del apartado</span>${esc(fecha(layaway.date))}</td>
        <td><span class="etq">Fecha límite</span>${layaway.due_date ? esc(fechaDia(layaway.due_date)) : 'Sin fecha límite'}</td>
      </tr>
      <tr>
        <td><span class="etq">Cliente</span>${esc(client?.name || '—')}${
          client?.phone ? ` · ${esc(client.phone)}` : ''
        }</td>
        <td><span class="etq">Estado</span>${esc(ESTADO[layaway.status] || layaway.status)}</td>
      </tr>
      <tr>
        <td><span class="etq">Sucursal</span>${esc(layaway.location || '—')}</td>
        <td><span class="etq">Atendió</span>${esc(layaway.cashier || '—')}</td>
      </tr>
    </table>

    <h3>Artículos apartados</h3>
    <table class="items">
      <thead>
        <tr><th>Clave</th><th>Descripción</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Importe</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>

    <table class="totales">
      <tr><td>Total del apartado</td><td class="num">${money(totals.total)}</td></tr>
      <tr><td>Abonado</td><td class="num">${money(totals.paid)}</td></tr>
      <tr class="resta"><td>Le falta</td><td class="num">${money(totals.balance_due)}</td></tr>
    </table>

    <h3>Historial de abonos</h3>
    <table class="items">
      <thead><tr><th>Fecha</th><th>Forma de pago</th><th class="num">Importe</th></tr></thead>
      <tbody>${abonos}</tbody>
    </table>

    ${aviso}

    <footer>
      <p>Conserva este comprobante para abonar, recoger o liquidar tu apartado.</p>
      ${
        // Las líneas de pie del negocio hablan de compras y cambios: aquí
        // todavía no hay venta, así que solo se imprimen cuando ya se liquidó.
        layaway.status === 'completed'
          ? (business.footer_lines || []).map((l) => `<p>${esc(l)}</p>`).join('')
          : ''
      }
    </footer>
  `;
}

const ESTILOS = `
  .recibo { font-family: 'Inter', Arial, Helvetica, sans-serif; color: #2d3436; max-width: 620px; margin: 0 auto; font-size: 13px; line-height: 1.45; }
  .recibo header { text-align: center; border-bottom: 2px solid #ff6b9d; padding-bottom: 8px; margin-bottom: 12px; }
  .recibo h1 { font-size: 20px; margin: 0 0 2px; letter-spacing: .04em; }
  .recibo .negocio { margin: 0; font-size: 11px; color: #636e72; }
  .recibo h2 { font-size: 15px; text-align: center; margin: 0 0 12px; }
  .recibo h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #636e72; margin: 16px 0 4px; }
  .recibo table { width: 100%; border-collapse: collapse; }
  .recibo .datos td { padding: 3px 0; vertical-align: top; width: 50%; }
  .recibo .etq { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #636e72; }
  .recibo .items th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #636e72; border-bottom: 1px solid #dfe6e9; padding: 4px 4px 4px 0; }
  .recibo .items td { padding: 5px 4px 5px 0; border-bottom: 1px solid #f1f2f6; vertical-align: top; }
  .recibo .items .sku { font-family: 'Courier New', monospace; font-weight: 700; white-space: nowrap; }
  .recibo .num { text-align: right; white-space: nowrap; }
  .recibo .vacio { color: #636e72; font-style: italic; }
  .recibo .totales { margin-top: 10px; }
  .recibo .totales td { padding: 3px 0; }
  .recibo .totales td.num { font-weight: 600; }
  .recibo .totales .resta td { border-top: 2px solid #2d3436; padding-top: 6px; font-size: 15px; font-weight: 700; }
  .recibo .aviso { margin: 14px 0 0; padding: 8px 10px; border-radius: 6px; background: #fff5f8; border: 1px solid #ffd3e2; }
  .recibo .aviso.vencido { background: #fff1f0; border-color: #ffb8b3; font-weight: 600; }
  .recibo .aviso.pagado { background: #f0fbf6; border-color: #a8e6cf; }
  .recibo .aviso.cancelado { background: #f5f6f7; border-color: #dfe6e9; }
  .recibo footer { margin-top: 18px; padding-top: 8px; border-top: 1px dashed #b2bec3; text-align: center; font-size: 10px; color: #636e72; }
  .recibo footer p { margin: 2px 0; }
`;

/** HTML del comprobante para incrustar en la previsualización. */
export function receiptInnerHtml(payload) {
  return `<style>${ESTILOS}</style><div class="recibo">${cuerpo(payload)}</div>`;
}

/**
 * Abre el comprobante en una ventana aparte y lanza el diálogo de impresión.
 * Ahí la cajera elige la impresora (térmica o de hojas) y puede guardarlo en
 * PDF si lo quiere mandar por correo o WhatsApp como archivo.
 */
export function printReceipt(payload) {
  const win = window.open('', '_blank', 'width=760,height=900');
  if (!win) return false;

  win.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Apartado #${payload.layaway.id} — ${esc(payload.business.name)}</title>
  <style>
    @page { margin: 12mm; }
    body { margin: 0; }
    ${ESTILOS}
  </style>
</head>
<body>
  <div class="recibo">${cuerpo(payload)}</div>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
  return true;
}

/** Resumen en texto para mandar por WhatsApp o mensaje. */
export function receiptText(payload) {
  const { business, layaway, client, items, totals, payments } = payload;
  const lineas = [
    `*${business.name}* — Comprobante de apartado #${layaway.id}`,
    '',
    `Cliente: ${client?.name || '—'}`,
    `Fecha del apartado: ${fecha(layaway.date)}`,
    layaway.due_date ? `Fecha límite: ${fechaDia(layaway.due_date)}` : 'Sin fecha límite',
    '',
    'Artículos:'
  ];

  items.forEach((it) => {
    const cant = it.quantity > 1 ? ` x${it.quantity}` : '';
    lineas.push(`• ${it.sku} — ${it.description}${cant}: ${money(it.total)}`);
  });

  lineas.push(
    '',
    `Total: ${money(totals.total)}`,
    `Abonado: ${money(totals.paid)}`,
    `*Le falta: ${money(totals.balance_due)}*`
  );

  if (payments.length) {
    lineas.push('', 'Abonos:');
    payments.forEach((p) => lineas.push(`• ${fechaHora(p.date)} — ${p.label}: ${money(p.amount)}`));
  }

  if (layaway.status === 'cancelled') {
    lineas.push('', 'Este apartado fue cancelado.');
  } else if (totals.balance_due <= 0) {
    lineas.push('', '¡Apartado liquidado, gracias por tu compra!');
  } else if (layaway.is_overdue) {
    lineas.push('', 'La fecha límite ya pasó. Pasa a la tienda para ponerlo al día.');
  }

  if (business.address) lineas.push('', business.address);
  if (business.phone) lineas.push(`Tel. ${business.phone}`);

  return lineas.join('\n');
}

/** Link de WhatsApp con el comprobante ya escrito. */
export function whatsappUrl(payload) {
  const digits = String(payload.client?.phone || '').replace(/\D/g, '');
  // Los teléfonos se capturan a 10 dígitos: wa.me necesita la lada de país.
  const numero = digits.length === 10 ? `52${digits}` : digits;
  const texto = encodeURIComponent(receiptText(payload));
  return numero ? `https://wa.me/${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
}
