import { HttpService } from './http.service';

export type LayawayStatus = 'active' | 'completed' | 'cancelled';
export type CancelRefundMethod = 'efectivo' | 'credito_tienda' | 'forfeited';

/**
 * Regla del anticipo según Pablo: un 25% del total, con mínimo $100.
 *
 * Es una **sugerencia, no un requisito**: él a veces acepta menos y pidió
 * conservar esa flexibilidad, pero quiere ver siempre el 25% como referencia
 * de lo que deberían dejar.
 */
export const DEPOSITO_PORCENTAJE = 0.25;
export const DEPOSITO_MINIMO = 100;

export function depositoSugerido(total: number): number {
  if (!total || total <= 0) return 0;
  const sugerido = Math.max(DEPOSITO_MINIMO, total * DEPOSITO_PORCENTAJE);
  // Nunca sugerir más que el total: en artículos baratos el mínimo de $100
  // podría pasarse del precio.
  return Math.round(Math.min(sugerido, total) * 100) / 100;
}

export interface Layaway {
  id: number;
  client_id: number;
  client_name?: string;
  client_phone?: string;
  user_name?: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: LayawayStatus;
  due_date?: string | null;
  sale_id?: number | null;
  notes?: string | null;
  is_overdue?: boolean;
  items?: any[];
  payments?: any[];
  items_count?: number;
  created_at?: string;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_refund_method?: CancelRefundMethod | null;
}

export class LayawayService {
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

  async createLayaway(data: any): Promise<Layaway> {
    this.refreshToken();
    const response = await this.http.post<any>('/layaways', data);
    return response.data;
  }

  async addPayment(id: number, data: { amount: number; payment_method: string; notes?: string }): Promise<Layaway> {
    this.refreshToken();
    const response = await this.http.post<any>(`/layaways/${id}/payments`, data);
    return response.data;
  }

  async cancelLayaway(id: number, data: { refund_method: CancelRefundMethod; reason?: string }): Promise<Layaway> {
    this.refreshToken();
    const response = await this.http.post<any>(`/layaways/${id}/cancel`, data);
    return response.data;
  }

  async getLayaways(params: Record<string, any> = {}): Promise<{ layaways: Layaway[]; total: number; pages: number }> {
    this.refreshToken();
    const response = await this.http.get<any>('/layaways', params);
    return {
      layaways: response.data || [],
      total: response.pagination?.total || 0,
      pages: response.pagination?.pages || 0
    };
  }

  async getLayawayById(id: number): Promise<Layaway> {
    this.refreshToken();
    const response = await this.http.get<any>(`/layaways/${id}`);
    return response.data;
  }

  async getStats(): Promise<any> {
    this.refreshToken();
    try {
      const response = await this.http.get<any>('/layaways/stats');
      return response.data;
    } catch {
      return { activos: 0, por_cobrar: 0, abonado: 0, vencidos: 0, liquidados: 0 };
    }
  }
}

export const layawayService = new LayawayService();

export const formatCurrency = (amount: any) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount) || 0);
