import { HttpService } from './http.service';
import { AuthService } from './auth.service';

export interface Sale {
  id: number;
  client_id?: number;
  client_name?: string;
  user_id: number;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  status: 'completed' | 'cancelled' | 'refunded';
  location: string;
  notes?: string;
  items?: SaleItem[];
  client?: {
    id: number;
    name: string;
    phone: string;
    email?: string;
  };
  items_count?: number;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  inventario_id: string;
  quantity_sold: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  product_info?: {
    category_name?: string;
    subcategory_name?: string;
    brand_name?: string;
    features?: any;
    available_quantity?: number;
  };
}

export interface CreateSaleRequest {
  client_id?: number;
  client_name?: string;
  payment_method: string;
  notes?: string;
  items: {
    inventario_id: string;
    quantity_sold: number;
    unit_price: number;
    notes?: string;
  }[];
}

export interface SaleFilters {
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

export interface InventoryItem {
  id: string;
  quantity: number;
  location: string;
  created_at: string;
  updated_at: string;
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

export interface InventoryFilters {
  q?: string;
  category_id?: number;
  subcategory_id?: number;
  location?: string;
  available_only?: boolean;
  page?: number;
  limit?: number;
}

export class SalesService {
  private http: HttpService;
  private authService: AuthService;
  private baseUrl = '/sales';
  private inventoryUrl = '/inventory';
  private initialized = false;

  constructor() {
    this.http = new HttpService();
    this.authService = new AuthService();
    console.log('🛒 SalesService: Creado');
  }

  // Inicializar solo en el navegador
  private initializeIfBrowser(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }
    
    console.log('🛒 SalesService: Inicializando en navegador...');
    this.initialized = true;
  }

  // Actualizar token de autenticación
  private refreshAuthToken(): void {
    const token = this.authService.getToken();
    if (token) {
      this.http.setAuthToken(token);
    }
  }

  // Verificar y actualizar token antes de cada llamada
  private ensureAuthenticated(): void {
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

  // Crear nueva venta
  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    this.ensureAuthenticated();
    const response = await this.http.post<{ data: Sale }>(this.baseUrl, saleData);
    return response.data;
  }

  // Obtener lista de ventas
  async getSales(filters: SaleFilters = {}): Promise<{ sales: Sale[]; total: number; pagination: any }> {
    this.ensureAuthenticated();
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    const response = await this.http.get<{ data: Sale[]; total: number; pagination: any }>(url);
    
    return {
      sales: response.data,
      total: response.total,
      pagination: response.pagination
    };
  }

  // Obtener venta específica
  async getSale(id: number): Promise<Sale> {
    this.ensureAuthenticated();
    const response = await this.http.get<{ data: Sale }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Buscar productos en inventario
  async searchInventory(filters: InventoryFilters = {}): Promise<{ items: InventoryItem[]; total: number; pagination: any }> {
    this.ensureAuthenticated();
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = params.toString() ? `${this.inventoryUrl}/search?${params}` : `${this.inventoryUrl}/search`;
    const response = await this.http.get<{ data: InventoryItem[]; total: number; pagination: any }>(url);
    
    return {
      items: response.data,
      total: response.total,
      pagination: response.pagination
    };
  }

  // Obtener productos disponibles (con stock > 0)
  async getAvailableInventory(filters: Omit<InventoryFilters, 'available_only'> = {}): Promise<{ items: InventoryItem[]; total: number; pagination: any }> {
    this.ensureAuthenticated();
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = params.toString() ? `${this.inventoryUrl}/available?${params}` : `${this.inventoryUrl}/available`;
    const response = await this.http.get<{ data: InventoryItem[]; total: number; pagination: any }>(url);
    
    return {
      items: response.data,
      total: response.total,
      pagination: response.pagination
    };
  }

  // Método de utilidad para formatear precio
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  // Método de utilidad para formatear fecha
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }

  // Método de utilidad para generar descripción del producto
  getProductDescription(item: InventoryItem): string {
    const valuation = item.valuation_item;
    if (!valuation) return item.id;

    const parts = [];
    
    if (valuation.subcategory_name) parts.push(valuation.subcategory_name);
    if (valuation.brand_name) parts.push(valuation.brand_name);
    if (valuation.status) parts.push(`(${valuation.status})`);

    return parts.length > 0 ? parts.join(' - ') : item.id;
  }
}

export const salesService = new SalesService();