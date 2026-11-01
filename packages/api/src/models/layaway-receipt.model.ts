/**
 * LayawayReceiptPayload v1 — comprobante del apartado que se entrega al cliente.
 *
 * Pablo lo pidió para imprimir y entregar, o mandar por WhatsApp / mensaje:
 * el cliente necesita un papel que diga qué apartó, cuánto dejó, cuánto le
 * falta y hasta cuándo tiene para pagarlo.
 *
 * Reutiliza la forma de TicketPayloadV1 (mismos bloques de negocio y de
 * artículo) para que mañana pueda imprimirse por la térmica sin inventar otro
 * contrato. Si cambia, debe ser v2.
 */

import { TicketBusiness, TicketClient, TicketItem } from './ticket.model';

export interface LayawayReceiptPayloadV1 {
  version: 1;
  business: TicketBusiness;
  layaway: LayawayReceiptHeader;
  client: TicketClient | null;
  items: TicketItem[];
  totals: LayawayReceiptTotals;
  payments: LayawayReceiptPayment[];
}

export interface LayawayReceiptHeader {
  id: number;
  /** Fecha en que se apartó. */
  date: string;
  /** Fecha límite acordada, o null si se dejó libre. */
  due_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  /** true si tiene fecha límite y ya pasó, para imprimir el aviso. */
  is_overdue: boolean;
  location: string;
  cashier: string;
}

export interface LayawayReceiptTotals {
  items_count: number;
  total: number;
  /** Suma de todos los abonos, incluido el anticipo inicial. */
  paid: number;
  /** total - paid. Cero cuando ya está liquidado. */
  balance_due: number;
}

export interface LayawayReceiptPayment {
  date: string;
  method: string;
  label: string;
  amount: number;
  notes: string | null;
}
