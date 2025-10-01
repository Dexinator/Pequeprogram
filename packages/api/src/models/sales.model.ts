import { BaseModel } from './index';

export interface Sale extends BaseModel {
  client_id?: number;
  client_name?: string;
  user_id: number;
  sale_date: Date;
  total_amount: number;
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
    category_id: number;
    subcategory_id: number;
    brand_id?: number;
    status: string;
    features: any;
    final_sale_price?: number;
    category_name?: string;
    subcategory_name?: string;
    brand_name?: string;
  };
}