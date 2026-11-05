/**
 * CreditStatementPayload v1 — estado de cuenta del crédito de tienda.
 *
 * Pablo lo pidió porque los clientes preguntan seguido cuánto crédito les
 * queda: *"un reporte en clientes para que sepan cuánto crédito de tienda
 * tienen"*. Se imprime y se entrega, o se manda por WhatsApp, igual que el
 * comprobante de apartado.
 *
 * Comparte el bloque de negocio y de cliente con el ticket para que los tres
 * papeles que salen del mostrador se vean iguales. Si cambia, debe ser v2.
 */

import { TicketBusiness, TicketClient } from './ticket.model';

export interface CreditStatementPayloadV1 {
  version: 1;
  business: TicketBusiness;
  client: TicketClient;
  /** Saldo a favor del cliente al momento de generar el documento. */
  balance: number;
  /** Cuándo se generó: el saldo cambia con cada compra, hay que fecharlo. */
  generated_at: string;
  movements: CreditStatementMovement[];
  /** true si se recortó la lista de movimientos por el límite pedido. */
  movements_truncated: boolean;
}

export interface CreditStatementMovement {
  date: string;
  /** Positivo cuando se le abona, negativo cuando lo usa. */
  amount: number;
  label: string;
  /** Saldo que quedó después del movimiento. */
  balance_after: number;
  reason: string | null;
}
