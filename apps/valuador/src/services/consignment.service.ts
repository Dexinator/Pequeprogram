import { HttpService } from './http.service';
import { AuthService } from './auth.service';

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

class ConsignmentService {
  private http: HttpService;
  private authService: AuthService;
  private baseUrl = '/consignments';

  constructor() {
    this.http = new HttpService();
    this.authService = new AuthService();
    this.initializeIfBrowser();
  }

  // Inicializar solo si estamos en un entorno de navegador
  private initializeIfBrowser() {
    if (typeof window !== 'undefined') {
      this.refreshAuthToken();
    }
  }

  // Actualizar el token de autenticación en las cabeceras HTTP
  private refreshAuthToken() {
    const token = this.authService.getToken();
    if (token) {
      this.http.setAuthToken(token);
    }
  }

  // Asegurar que el usuario esté autenticado antes de hacer peticiones
  private ensureAuthenticated() {
    console.log('🛡️ ensureAuthenticated() - Verificando autenticación...');
    
    // Asegurar que estemos inicializados
    this.initializeIfBrowser();
    
    console.log('🛡️ Llamando a refreshAuthToken()...');
    this.refreshAuthToken();
    
    // Verificar si tenemos un token válido
    const token = this.authService.getToken();
    console.log('🛡️ Token final verificado:', token ? `${token.substring(0, 50)}...` : 'null');
    
    if (!token) {
      console.error('❌ No está autenticado para hacer la petición');
      throw new Error('No está autenticado. Por favor inicie sesión.');
    }
  }

  // Obtener todos los productos en consignación
  async getConsignments(filters: ConsignmentFilters = {}) {
    this.ensureAuthenticated();
    
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.status) params.status = filters.status;
    if (filters.location) params.location = filters.location;
    if (filters.client_id) params.client_id = filters.client_id;

    const response = await this.http.get<{ data: ConsignmentProduct[]; pagination: any }>(this.baseUrl, params);
    
    return {
      consignments: response.data,
      pagination: response.pagination
    };
  }

  // Obtener un producto en consignación específico
  async getConsignment(id: number): Promise<ConsignmentProduct> {
    this.ensureAuthenticated();
    const response = await this.http.get<{ data: ConsignmentProduct }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Marcar consignación como pagada
  async markAsPaid(id: number, paidAmount: number, notes?: string): Promise<ConsignmentProduct> {
    this.ensureAuthenticated();
    const response = await this.http.put<{ data: ConsignmentProduct }>(`${this.baseUrl}/${id}/paid`, {
      paid_amount: paidAmount,
      notes
    });
    return response.data;
  }

  // Obtener estadísticas de consignaciones
  async getStats(): Promise<ConsignmentStats> {
    this.ensureAuthenticated();
    const response = await this.http.get<{ data: ConsignmentStats }>(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Formatear moneda
  formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  }

  // Formatear fecha
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
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
    const parts = [consignment.subcategory_name];
    
    if (consignment.features) {
      // Add important features
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
export default consignmentService;