/**
 * Reglas de negocio de los apartados, en un solo lugar.
 *
 * Están aquí y no dentro del servicio porque las necesitan tres cosas: la
 * cancelación (para proponer cuánto se devuelve), el comprobante que se le
 * entrega al cliente (para imprimir las condiciones) y el POS (que las lee del
 * API en lugar de recalcularlas, para que no se desfasen).
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Anticipo que la tienda pide como referencia: 25% del total, mínimo $100. */
export const DEPOSITO_PORCENTAJE = 0.25;
export const DEPOSITO_MINIMO = 100;

/**
 * El "mínimo de apartado" del que habla Pablo: 25% con piso de $100, sin
 * pasarse nunca del total (en artículos de menos de $100 el piso se saldría
 * del precio).
 *
 * Es una sugerencia, no un requisito: al apartar se acepta menos.
 */
export function depositoMinimo(total: number): number {
  if (!total || total <= 0) return 0;
  return round2(Math.min(Math.max(DEPOSITO_MINIMO, total * DEPOSITO_PORCENTAJE), total));
}

/**
 * Cuánto se le devuelve al cliente cuando el apartado se cancela o vence sin
 * liquidar.
 *
 * Regla de Pablo (Slack, 1-nov-2026): *"se recupera 50% del anticipo en
 * crédito de tienda"*, siendo el anticipo el mínimo calculado arriba. Sobre un
 * apartado de $2,000 (mínimo $500) se le devuelven $250, aunque haya abonado
 * más: el resto se lo queda la tienda porque la mercancía estuvo fuera de
 * venta todo el plazo.
 *
 * Nunca más de lo que realmente abonó, para no regalar crédito cuando el
 * anticipo que dejó fue menor al sugerido.
 *
 * Se redondea a pesos enteros a pedido de Pablo (Slack, 5-nov-2026): un
 * apartado de $450 proponía devolver $56.25, y entregar centavos en el
 * mostrador es incómodo. El tope de lo abonado se aplica **después** del
 * redondeo y se respeta tal cual: si abonó $56.50 se le devuelven $56.50, no
 * se le inventan pesos que no pagó.
 */
export const REEMBOLSO_CANCELACION_PORCENTAJE = 0.5;

export function reembolsoCancelacionSugerido(total: number, paid: number): number {
  const abonado = round2(Number(paid) || 0);
  if (abonado <= 0) return 0;
  const sugerido = Math.round(depositoMinimo(total) * REEMBOLSO_CANCELACION_PORCENTAJE);
  return round2(Math.min(sugerido, abonado));
}

/**
 * Condiciones que Pablo pidió imprimir en el comprobante, literales.
 *
 * El plazo solo aplica mientras el apartado está vigente; lo de los cambios
 * sigue aplicando una vez liquidado, cuando el cliente ya se llevó la
 * mercancía.
 */
export const CONDICION_PLAZO =
  'Vencido el plazo sin liquidar se recupera 50% del anticipo en crédito de tienda.';
export const CONDICION_CAMBIOS = 'No hay cambios de mercancía apartada.';

export function condicionesApartado(status: string): string[] {
  if (status === 'cancelled') return [];
  if (status === 'completed') return [CONDICION_CAMBIOS];
  return [CONDICION_PLAZO, CONDICION_CAMBIOS];
}
