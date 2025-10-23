import { HttpService } from './http.service';

export interface OnlineSaleItem {
  id: number;
  valuation_item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  subcategory_name: string;
  brand_name: string;
  inventory_id: string;
  images: string[];
  features?: any;
}

export interface OnlineSale {
  id: number;
  payment_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: {
    street: string;
    neighborhood: string;
    postal_code: string;
    city: string;
    state: string;
    references?: string;
  };
  total_amount: number;
  payment_status: string;
  payment_method: string;
  payment_date: string;
  notes?: string;
  shipping_cost: number;
  shipping_zone_id: number;
  shipping_postal_code: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  total_weight_grams: number;
  zone_name?: string;
  zone_code?: string;
  items: OnlineSaleItem[];
  created_at: string;
  updated_at: string;
}

export interface OnlineSalesListResponse {
  sales: OnlineSale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OnlineSalesStats {
  totalSales: {
    total_sales: number;
    total_revenue: number;
    average_sale: number;
  };
  salesByStatus: {
    payment_status: string;
    count: number;
    total: number;
  }[];
  recentSales: {
    date: string;
    count: number;
    total: number;
  }[];
  topProducts: {
    subcategory_name: string;
    brand_name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
  topShippingZones: {
    zone_name: string;
    zone_code: string;
    count: number;
    total_shipping_revenue: number;
  }[];
}

export interface ListOnlineSalesParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  customerEmail?: string;
  page?: number;
  limit?: number;
}

class OnlineSalesService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();

    // Inicializar el token si existe en localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  setAuthToken(token: string) {
    this.http.setAuthToken(token);
  }

  /**
   * Lista todas las ventas online con filtros opcionales
   */
  async listOnlineSales(params?: ListOnlineSalesParams): Promise<OnlineSalesListResponse> {
    // Actualizar token antes de la petición
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }

    return this.http.get<OnlineSalesListResponse>('/online-payments', params);
  }

  /**
   * Obtiene el detalle completo de una venta online
   */
  async getOnlineSaleById(id: number): Promise<OnlineSale> {
    // Actualizar token antes de la petición
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }

    return this.http.get<OnlineSale>(`/online-payments/${id}`);
  }

  /**
   * Obtiene estadísticas de ventas online
   */
  async getOnlineSalesStats(): Promise<OnlineSalesStats> {
    // Actualizar token antes de la petición
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }

    return this.http.get<OnlineSalesStats>('/online-payments/stats');
  }

  /**
   * Obtiene el estado de un pago por payment_id de MercadoPago
   */
  async getPaymentStatus(paymentId: string): Promise<OnlineSale> {
    // Actualizar token antes de la petición
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }

    return this.http.get<OnlineSale>(`/online-payments/status/${paymentId}`);
  }
}

export const onlineSalesService = new OnlineSalesService();
