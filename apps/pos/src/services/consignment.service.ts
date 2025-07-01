import { HttpService } from './http.service';

export interface ConsignmentProduct {
  id: number;
  valuation_id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string;
  features: any;
  consignment_price: number;
  final_sale_price: number;
  location: string;
  status: 'available' | 'sold_unpaid' | 'sold_paid';
  sold_date?: Date;
  sale_id?: number;
  sale_price?: number;
  notes?: string;
  consignment_paid: boolean;
  consignment_paid_date?: Date;
  consignment_paid_amount?: number;
  consignment_paid_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConsignmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  location?: string;
  client_id?: number;
}

export interface ConsignmentStats {
  total_items: number;
  available_items: number;
  sold_unpaid_items: number;
  sold_paid_items: number;
  total_available_value: number;
  total_unpaid_value: number;
  total_paid_value: number;
  total_sold_value: number;
}

export class ConsignmentService {
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

  // Obtener todos los productos en consignación
  async getConsignments(filters: ConsignmentFilters = {}) {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      const params: Record<string, any> = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.client_id) params.client_id = filters.client_id;

      const response = await this.http.get<any>('/consignments', params);
      
      return {
        consignments: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error al obtener consignaciones:', error);
      throw error;
    }
  }

  // Obtener un producto en consignación específico
  async getConsignment(id: number): Promise<ConsignmentProduct> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      const response = await this.http.get<any>(`/consignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener consignación:', error);
      throw error;
    }
  }

  // Marcar consignación como pagada
  async markAsPaid(id: number, paidAmount: number, notes?: string): Promise<ConsignmentProduct> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      const response = await this.http.put<any>(`/consignments/${id}/paid`, {
        paid_amount: paidAmount,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error al marcar consignación como pagada:', error);
      throw error;
    }
  }

  // Obtener estadísticas de consignaciones
  async getStats(): Promise<ConsignmentStats> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      const response = await this.http.get<any>('/consignments/stats');
      return response.data || {
        total_items: 0,
        available_items: 0,
        sold_unpaid_items: 0,
        sold_paid_items: 0,
        total_available_value: 0,
        total_unpaid_value: 0,
        total_paid_value: 0,
        total_sold_value: 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de consignaciones:', error);
      return {
        total_items: 0,
        available_items: 0,
        sold_unpaid_items: 0,
        sold_paid_items: 0,
        total_available_value: 0,
        total_unpaid_value: 0,
        total_paid_value: 0,
        total_sold_value: 0
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

  // Generar descripción del producto
  getProductDescription(consignment: ConsignmentProduct): string {
    const parts = [consignment.subcategory_name || 'Producto'];
    
    if (consignment.features) {
      // Agregar características importantes
      if (consignment.features.talla) parts.push(`Talla ${consignment.features.talla}`);
      if (consignment.features.color) parts.push(consignment.features.color);
      if (consignment.features.modelo) parts.push(consignment.features.modelo);
      if (consignment.features.tipo) parts.push(consignment.features.tipo);
    }
    
    if (consignment.brand_name && consignment.brand_name !== 'Sin marca') {
      parts.push(consignment.brand_name);
    }
    
    return parts.join(' - ');
  }
}

export const consignmentService = new ConsignmentService();