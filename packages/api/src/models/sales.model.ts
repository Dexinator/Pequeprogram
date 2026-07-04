import { BaseModel } from './index';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Sale extends BaseModel {
  client_id?: number;
  client_name?: string;
  user_id: number;
  sale_date: Date;
  total_amount: number;
  discount_type?: DiscountType | null;
  discount_value?: number;
  discount_amount?: number;
  payment_method?: string; // Deprecated - mantener para compatibilidad
  status: 'completed' | 'cancelled' | 'refunded';
  location: string;
  notes?: string;
  items?: SaleItem[];
  payment_details?: PaymentDetail[];
  client?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface PaymentDetail extends BaseModel {
  sale_id: number;
  payment_method: string;
  amount: number;
  notes?: string;
}

export interface SaleItem extends BaseModel {
  sale_id: number;
  inventario_id: string;
  quantity_sold: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  // Información del producto (joined)
  product_info?: {
    category_name?: string;
    subcategory_name?: string;
    brand_name?: string;
    features?: any;
    available_quantity?: number;
  };
}

// DTOs para request/response

export interface CreateSaleDto {
  client_id?: number;
  client_name?: string;
  payment_method?: string; // Deprecated - mantener para compatibilidad
  payment_details: CreatePaymentDetailDto[];
  notes?: string;
  items: CreateSaleItemDto[];
  discount_type?: DiscountType | null;
  discount_value?: number;
}

/**
 * Resuelve el descuento en pesos a aplicar sobre un subtotal.
 * - 'percentage': value es un porcentaje (0-100)
 * - 'fixed_amount': value es un importe en pesos
 * El resultado se acota a [0, subtotal] y se redondea a 2 decimales.
 */
export function resolveDiscountAmount(
  subtotal: number,
  type?: DiscountType | string | null,
  value?: number | null
): number {
  const v = Number(value) || 0;
  if (!type || v <= 0) return 0;

  let amount = 0;
  if (type === 'percentage') {
    amount = subtotal * (v / 100);
  } else if (type === 'fixed_amount') {
    amount = v;
  } else {
    return 0;
  }

  amount = Math.max(0, Math.min(amount, subtotal));
  return Math.round(amount * 100) / 100;
}

export interface CreatePaymentDetailDto {
  payment_method: string;
  amount: number;
  notes?: string;
}

export interface CreateSaleItemDto {
  inventario_id: string;
  quantity_sold: number;
  unit_price: number;
  notes?: string;
}

export interface SaleQueryParams {
  client_id?: number;
  user_id?: number;
  status?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InventorySearchParams {
  q?: string; // término de búsqueda
  category_id?: number;
  subcategory_id?: number;
  location?: string;
  available_only?: boolean; // solo productos con stock > 0
  page?: number;
  limit?: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
  location: string;
  created_at: Date;
  updated_at: Date;
  valuation_item_id?: number;
  // Información del producto relacionado
  valuation_item?: {
    category_id: number | null;
    subcategory_id: number | null;
    brand_id?: number | null;
    status: string | null;
    features: any;
    final_sale_price?: number | null;
    category_name?: string | null;
    subcategory_name?: string | null;
    brand_name?: string | null;
    images?: any;
  };
}