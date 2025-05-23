import { BaseModel } from './index';

export interface Subcategory extends BaseModel {
  category_id: number;
  name: string;
  sku: string;
  gap_new: number;
  gap_used: number;
  margin_new: number;
  margin_used: number;
  is_active: boolean;
}

export interface FeatureDefinition extends BaseModel {
  subcategory_id: number;
  name: string;
  display_name: string;
  type: 'texto' | 'numero' | 'seleccion';
  order_index: number;
  options?: string[]; // Para tipo seleccion
}

export interface ValuationFactor extends BaseModel {
  subcategory_id: number;
  factor_type: 'estado' | 'demanda' | 'limpieza';
  factor_value: string;
  score: number;
}

export interface Brand extends BaseModel {
  name: string;
  subcategory_id?: number;
  renown: 'Sencilla' | 'Normal' | 'Alta' | 'Premium';
  is_active: boolean;
}

export interface Client extends BaseModel {
  name: string;
  phone: string;
  email?: string;
  identification?: string;
  is_active: boolean;
}

export interface Valuation extends BaseModel {
  client_id: number;
  user_id: number;
  valuation_date: Date;
  total_purchase_amount?: number;
  total_consignment_amount?: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  items?: ValuationItem[];
}

export interface ValuationItem extends BaseModel {
  valuation_id: number;
  category_id: number;
  subcategory_id: number;
  brand_id?: number;
  status: string; // Nuevo, Usado como nuevo, etc.
  brand_renown: 'Sencilla' | 'Normal' | 'Alta' | 'Premium';
  modality: 'compra directa' | 'consignación';
  condition_state: 'excelente' | 'bueno' | 'regular';
  demand: 'alta' | 'media' | 'baja';
  cleanliness: 'buena' | 'regular' | 'mala';
  features?: Record<string, any>; // características específicas
  new_price: number;
  purchase_score?: number;
  sale_score?: number;
  suggested_purchase_price?: number;
  suggested_sale_price?: number;
  final_purchase_price?: number;
  final_sale_price?: number;
  consignment_price?: number;
  images?: string[];
  notes?: string;
}

// DTOs para request/response

export interface CreateValuationDto {
  client_id: number;
  notes?: string;
}

export interface AddValuationItemDto {
  category_id: number;
  subcategory_id: number;
  brand_id?: number;
  status: string;
  brand_renown: 'Sencilla' | 'Normal' | 'Alta' | 'Premium';
  modality: 'compra directa' | 'consignación';
  condition_state: 'excelente' | 'bueno' | 'regular';
  demand: 'alta' | 'media' | 'baja';
  cleanliness: 'buena' | 'regular' | 'mala';
  features?: Record<string, any>;
  new_price: number;
  images?: string[];
  notes?: string;
}

export interface CalculateValuationDto {
  subcategory_id: number;
  status: string; // Nuevo, Usado como nuevo, etc.
  condition_state: 'excelente' | 'bueno' | 'regular';
  demand: 'alta' | 'media' | 'baja';
  cleanliness: 'buena' | 'regular' | 'mala';
  new_price: number;
}

export interface ValuationCalculationResult {
  purchase_score: number;
  sale_score: number;
  suggested_purchase_price: number;
  suggested_sale_price: number;
  consignment_price?: number;
}

export interface FinalizeValuationDto {
  status: 'completed' | 'cancelled';
  notes?: string;
  items?: Array<{
    id: number;
    final_purchase_price?: number;
    final_sale_price?: number;
  }>;
}

export interface ValuationQueryParams {
  client_id?: number;
  user_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
} 