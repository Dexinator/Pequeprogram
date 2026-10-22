import { HttpService } from './http.service';

export type ReturnType = 'garantia' | 'sin_defecto';
export type RefundMethod = 'efectivo' | 'credito_tienda' | 'tarjeta';

export interface ReturnableSaleItem {
  sale_item_id: number;
  inventario_id: string;
  description: string;
  quantity_sold: number;
  quantity_returned: number;
  quantity_returnable: number;
  unit_price: number;
}

export interface ReturnableSale {
  sale_id: number;
  sale_date: string;
  client_id: number | null;
  client_name: string | null;
  total_amount: number;
  payments: { payment_method: string; amount: number }[];
  items: ReturnableSaleItem[];
  previous_returns: { id: number; return_date: string; total_amount: number; refund_method: string }[];
}

export interface CreateReturnData {
  sale_id: number;
  return_type: ReturnType;
  refund_method: RefundMethod;
  items: {
    sale_item_id: number;
    quantity_returned: number;
    restocked?: boolean;
    condition_notes?: string;
  }[];
  reason?: string;
  notes?: string;
}

export class ReturnsService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();
    this.refreshToken();
  }

  private refreshToken() {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('entrepeques_auth_token');
    if (token) this.http.setAuthToken(token);
  }

  /** Trae la venta con cuánto queda por devolver de cada renglón. */
  async getSaleForReturn(saleId: number): Promise<ReturnableSale> {
    this.refreshToken();
    const response = await this.http.get<any>(`/returns/sale/${saleId}`);
    return response.data;
  }

  async createReturn(data: CreateReturnData): Promise<any> {
    this.refreshToken();
    const response = await this.http.post<any>('/returns', data);
    return response.data;
  }

  async getReturns(params: Record<string, any> = {}): Promise<{ returns: any[]; total: number; pages: number }> {
    this.refreshToken();
    const response = await this.http.get<any>('/returns', params);
    return {
      returns: response.data || [],
      total: response.pagination?.total || 0,
      pages: response.pagination?.pages || 0
    };
  }

  async getReturnById(id: number): Promise<any> {
    this.refreshToken();
    const response = await this.http.get<any>(`/returns/${id}`);
    return response.data;
  }

  async getStats(): Promise<any> {
    this.refreshToken();
    try {
      const response = await this.http.get<any>('/returns/stats');
      return response.data;
    } catch {
      return { total_returns: 0, total_amount: 0, total_cash: 0, total_card: 0, total_credit: 0, garantias: 0, este_mes: 0 };
    }
  }
}

export const returnsService = new ReturnsService();

export const formatCurrency = (amount: any) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount) || 0);
