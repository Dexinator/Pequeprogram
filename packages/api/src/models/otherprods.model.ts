export interface OtherProd {
  id?: number;
  user_id: number;
  supplier_name: string;
  purchase_date?: Date;
  total_amount: number;
  payment_method: string;
  location: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  items?: OtherProdItem[];
  user?: {
    first_name: string;
    last_name: string;
  };
}

export interface OtherProdItem {
  id?: number;
  otherprod_id: number;
  product_name: string;
  quantity: number;
  purchase_unit_price: number;
  sale_unit_price: number;
  total_purchase_price: number;
  sku?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateOtherProdDto {
  supplier_name: string;
  payment_method: string;
  location: string;
  notes?: string;
  items: CreateOtherProdItemDto[];
}

export interface CreateOtherProdItemDto {
  product_name: string;
  quantity: number;
  purchase_unit_price: number;
  sale_unit_price: number;
}

export interface OtherProdQueryParams {
  page?: number;
  limit?: number;
  supplier_name?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

export interface OtherProdStats {
  total_purchases: number;
  total_amount: number;
  total_items: number;
  purchases_today: number;
  amount_today: number;
  purchases_week: number;
  amount_week: number;
  top_products: {
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
}