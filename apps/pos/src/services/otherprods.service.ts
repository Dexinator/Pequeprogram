import { HttpService } from './http.service';

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
  items_count?: number;
  total_quantity?: number;
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
}

export interface CreateOtherProdData {
  supplier_name: string;
  payment_method: string;
  location: string;
  notes?: string;
  items: {
    product_name: string;
    quantity: number;
    purchase_unit_price: number;
    sale_unit_price: number;
  }[];
}

export interface OtherProdFilters {
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

export class OtherProdsService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();
    
    // Si hay un token guardado, configurarlo
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Crear nueva compra
  async createPurchase(purchaseData: CreateOtherProdData): Promise<OtherProd | null> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const response = await this.http.post<any>('/otherprods', purchaseData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear la compra');
    } catch (error) {
      console.error('Error al crear compra:', error);
      throw error;
    }
  }

  // Obtener una compra específica
  async getPurchase(id: number): Promise<OtherProd | null> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const response = await this.http.get<any>(`/otherprods/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener compra:', error);
      return null;
    }
  }

  // Obtener compras con filtros
  async getPurchases(filters: OtherProdFilters = {}): Promise<{ purchases: OtherProd[], total: number }> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const params: Record<string, any> = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.supplier_name) params.supplier_name = filters.supplier_name;
      if (filters.location) params.location = filters.location;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await this.http.get<any>('/otherprods', params);
      
      return {
        purchases: response.data || [],
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error al obtener compras:', error);
      return { purchases: [], total: 0 };
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<OtherProdStats> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const response = await this.http.get<any>('/otherprods/stats');
      
      return response.data || {
        total_purchases: 0,
        total_amount: 0,
        total_items: 0,
        purchases_today: 0,
        amount_today: 0,
        purchases_week: 0,
        amount_week: 0,
        top_products: []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total_purchases: 0,
        total_amount: 0,
        total_items: 0,
        purchases_today: 0,
        amount_today: 0,
        purchases_week: 0,
        amount_week: 0,
        top_products: []
      };
    }
  }

  // Formatear moneda
  formatCurrency(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
      return '$0.00';
    }
    
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  }

  // Formatear fecha
  formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calcular margen de ganancia
  calculateMargin(purchasePrice: number, salePrice: number): number {
    if (purchasePrice === 0) return 100;
    return ((salePrice - purchasePrice) / purchasePrice) * 100;
  }
}

export const otherProdsService = new OtherProdsService();