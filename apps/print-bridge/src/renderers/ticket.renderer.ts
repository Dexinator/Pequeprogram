import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer';
import { TicketPayloadV1 } from '../types/ticket.types';

interface RenderResult {
  buffer: Buffer;
  preview: string;
}

const COLUMNS = 42;

/**
 * Renders a TicketPayload v1 to ESC/POS bytes for the Epson TM-T88IV.
 * Uses node-thermal-printer in buffer mode so the same code path can dry-run
 * (return the bytes) and live-print (send the same bytes to USB).
 *
 * Layout assumes 80mm paper at Font A (42 columns).
 */
export async function renderTicketToEscpos(
  payload: TicketPayloadV1,
  options: { showSkuPerItem: boolean; showStoreCredit: boolean; showSaleBarcode: boolean }
): Promise<RenderResult> {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'buffer',
    characterSet: CharacterSet.PC858_EURO,
    width: COLUMNS,
    options: { timeout: 5000 },
  });

  printer.alignCenter();
  printer.bold(true);
  printer.setTextSize(1, 1);
  printer.println(payload.business.name.toUpperCase());
  printer.bold(false);
  printer.setTextNormal();
  printer.println(payload.business.address);
  printer.println(`Tel. ${payload.business.phone}`);
  if (payload.business.rfc) printer.println(`RFC ${payload.business.rfc}`);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Venta:    #${String(payload.sale.id).padStart(6, '0')}`);
  printer.println(`Fecha:    ${formatDate(payload.sale.date)}`);
  printer.println(`Sucursal: ${payload.sale.location}`);
  printer.println(`Cajero:   ${payload.sale.cashier}`);
  if (payload.client) {
    printer.println(`Cliente:  ${payload.client.name}`);
  }
  printer.drawLine();

  for (const item of payload.items) {
    const qtyLine = `${item.quantity} x ${item.description}`;
    printer.println(wrap(qtyLine, COLUMNS));
    if (options.showSkuPerItem) {
      printer.println(`  ${item.sku}`);
    }
    printer.alignRight();
    printer.println(formatMoney(item.total));
    printer.alignLeft();
    printer.newLine();
  }

  printer.drawLine();
  printer.alignRight();
  printer.bold(true);
  printer.println(twoCol('TOTAL', formatMoney(payload.totals.total), COLUMNS));
  printer.bold(false);
  for (const payment of payload.payments) {
    printer.println(twoCol(payment.label, formatMoney(payment.amount), COLUMNS));
  }
  printer.alignLeft();

  if (options.showStoreCredit && payload.store_credit_remaining !== null) {
    printer.drawLine();
    printer.alignCenter();
    printer.println('Crédito en tienda restante');
    printer.println(formatMoney(payload.store_credit_remaining));
  }

  if (payload.notes) {
    printer.drawLine();
    printer.alignLeft();
    printer.println(payload.notes);
  }

  printer.drawLine();
  printer.alignCenter();
  for (const line of payload.business.footer_lines) {
    printer.println(line);
  }
  if (payload.business.website) {
    printer.println(payload.business.website);
  }

  if (options.showSaleBarcode) {
    printer.newLine();
    printer.code128(payload.sale.barcode.value, { height: 60, text: 2 });
    printer.println(`Venta #${payload.sale.id}`);
  }

  printer.cut();

  const buffer = printer.getBuffer();
  return {
    buffer,
    preview: buffer.toString('latin1'),
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

function twoCol(left: string, right: string, width: number): string {
  const padding = Math.max(1, width - left.length - right.length);
  return `${left}${' '.repeat(padding)}${right}`;
}

function wrap(text: string, width: number): string {
  if (text.length <= width) return text;
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > width) {
    let cut = remaining.lastIndexOf(' ', width);
    if (cut <= 0) cut = width;
    lines.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
    if (lines.length === 1) {
      // continuation lines indent
      remaining = `  ${remaining}`;
    }
  }
  lines.push(remaining);
  return lines.join('\n');
}
