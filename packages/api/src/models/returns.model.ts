import { BaseModel } from './index';

/**
 * Devoluciones de mercancía.
 *
 * Reglas acordadas con Pablo:
 * - Parcial por artículo: el ticket completo es solo el caso de seleccionar todo.
 * - `garantia` (defecto) propone devolver dinero y NO reingresar el artículo;
 *   `sin_defecto` propone crédito de tienda y SÍ reingresarlo. Son valores por
 *   defecto, no restricciones: la cajera decide y el sistema no bloquea.
 * - Sin límite de tiempo desde la compra.
 * - No se bloquea por cómo se pagó la venta original (solo se informa).
 */

export type ReturnType = 'garantia' | 'sin_defecto';
/**
 * `tarjeta` es la reversa en la terminal, que normalmente solo procede el
 * mismo día de la venta. Pablo la pidió para que la conciliación diaria de
 * movimientos cuadre: una devolución con tarjeta no debe contarse como
 * salida de efectivo.
 */
export type RefundMethod = 'efectivo' | 'credito_tienda' | 'tarjeta';

export interface Return extends BaseModel {
  sale_id: number;
  client_id?: number | null;
  user_id: number;
  return_date: Date;
  total_amount: number;
  return_type: ReturnType;
  refund_method: RefundMethod;
  location?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: string;
  items?: ReturnItem[];
  // Datos unidos para listados
  client_name?: string | null;
  user_name?: string | null;
}

export interface ReturnItem {
  id?: number;
  return_id?: number;
  sale_item_id: number;
  inventario_id: string;
  quantity_returned: number;
  unit_price: number;
  total_price: number;
  restocked: boolean;
  condition_notes?: string | null;
  // Descripción del producto para mostrarlo
  description?: string | null;
}

export interface CreateReturnItemDto {
  sale_item_id: number;
  quantity_returned: number;
  /** Si el artículo vuelve al inventario. Por defecto TRUE. */
  restocked?: boolean;
  condition_notes?: string;
}

export interface CreateReturnDto {
  sale_id: number;
  return_type: ReturnType;
  refund_method: RefundMethod;
  items: CreateReturnItemDto[];
  reason?: string;
  notes?: string;
  location?: string;
}

/** Renglón de una venta con lo que ya se devolvió, para armar la pantalla. */
export interface ReturnableSaleItem {
  sale_item_id: number;
  inventario_id: string;
  description: string;
  quantity_sold: number;
  quantity_returned: number;
  /** quantity_sold - quantity_returned */
  quantity_returnable: number;
  unit_price: number;
}

export interface ReturnableSale {
  sale_id: number;
  sale_date: Date;
  client_id: number | null;
  client_name: string | null;
  total_amount: number;
  /** Cómo se pagó la venta: informativo, no restringe el método de devolución. */
  payments: { payment_method: string; amount: number }[];
  items: ReturnableSaleItem[];
  /** Devoluciones previas de esta misma venta. */
  previous_returns: { id: number; return_date: Date; total_amount: number; refund_method: string }[];
}

export interface ReturnQueryParams {
  sale_id?: number;
  client_id?: number;
  return_type?: ReturnType;
  refund_method?: RefundMethod;
  start_date?: string;
  end_date?: string;
  location?: string;
  page?: number;
  limit?: number;
}
