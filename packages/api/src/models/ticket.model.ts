/**
 * TicketPayload v1 — formato del payload que el API entrega al Print Bridge local
 * para imprimir tickets de venta. Es un contrato congelado: si cambia, debe ser v2.
 */

export interface TicketPayloadV1 {
  version: 1;
  business: TicketBusiness;
  sale: TicketSale;
  client: TicketClient | null;
  items: TicketItem[];
  totals: TicketTotals;
  payments: TicketPayment[];
  store_credit_remaining: number | null;
  notes: string | null;
}

export interface TicketBusiness {
  name: string;
  address: string;
  phone: string;
  rfc: string | null;
  website: string | null;
  logo_url: string | null;
  footer_lines: string[];
}

export interface TicketSale {
  id: number;
  date: string;
  location: string;
  cashier: string;
  barcode: {
    value: string;
    format: 'CODE128';
  };
}

export interface TicketClient {
  id: number | null;
  name: string;
  phone: string | null;
}

export interface TicketItem {
  sku: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface TicketPayment {
  method: string;
  label: string;
  amount: number;
  notes: string | null;
}

export interface TicketTotals {
  items_count: number;
  subtotal: number;
  total: number;
}
