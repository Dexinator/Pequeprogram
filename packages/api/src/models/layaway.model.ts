import { BaseModel } from './index';

/**
 * Apartados.
 *
 * Regla que gobierna todo el módulo: **apartar descuenta stock**, igual que
 * una venta. Si no, el artículo apartado seguiría disponible y podría venderse
 * otra vez, en mostrador o en la tienda en línea.
 *
 * De ahí se derivan las otras dos: liquidar crea la venta SIN volver a
 * descontar, y cancelar devuelve el stock.
 */

export type LayawayStatus = 'active' | 'completed' | 'cancelled';
/** Qué se hace con el anticipo al cancelar. `forfeited` = se queda la tienda. */
export type CancelRefundMethod = 'efectivo' | 'credito_tienda' | 'forfeited';

export interface Layaway extends BaseModel {
  client_id: number;
  user_id: number;
  location?: string | null;
  total_amount: number;
  paid_amount: number;
  /** total_amount - paid_amount */
  balance_due?: number;
  status: LayawayStatus;
  due_date?: string | null;
  sale_id?: number | null;
  notes?: string | null;
  completed_at?: Date | null;
  cancelled_at?: Date | null;
  cancel_refund_method?: CancelRefundMethod | null;
  items?: LayawayItem[];
  payments?: LayawayPayment[];
  // Datos unidos
  client_name?: string | null;
  client_phone?: string | null;
  user_name?: string | null;
  /** true si tiene fecha límite y ya pasó. El sistema avisa, no cancela solo. */
  is_overdue?: boolean;
}

export interface LayawayItem {
  id?: number;
  layaway_id?: number;
  inventario_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description?: string | null;
}

export interface LayawayPayment {
  id?: number;
  layaway_id?: number;
  user_id: number;
  payment_method: string;
  amount: number;
  notes?: string | null;
  created_at?: Date;
  user_name?: string | null;
}

export interface CreateLayawayItemDto {
  inventario_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateLayawayDto {
  /** Obligatorio: sin cliente no hay a quién cobrarle el resto. */
  client_id: number;
  items: CreateLayawayItemDto[];
  /** Anticipo inicial. Puede ser 0 si se aparta sin pago. */
  deposit_amount?: number;
  deposit_method?: string;
  due_date?: string;
  notes?: string;
  location?: string;
}

export interface AddLayawayPaymentDto {
  amount: number;
  payment_method: string;
  notes?: string;
}

export interface CancelLayawayDto {
  /** Qué se hace con lo ya abonado. */
  refund_method: CancelRefundMethod;
  reason?: string;
}

export interface LayawayQueryParams {
  client_id?: number;
  status?: LayawayStatus;
  /** Solo los que ya pasaron su fecha límite y siguen activos. */
  overdue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
