import { HttpService } from './http.service';

export interface SearchInventoryParams {
  q?: string;  // Cambiar de 'search' a 'q'
  category_id?: number;
  location?: string;
  available_only?: boolean;
  page?: number;
  limit?: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
  location: string;
  created_at?: string;
  updated_at?: string;
  valuation_item?: {
    category_id: number;
    subcategory_id: number;
    brand_id: number;
    status: string;
    features: any;
    final_sale_price: number;
    category_name: string;
    subcategory_name: string;
    brand_name: string;
  };
  // Campos planos para facilitar el acceso
  category_name?: string;
  subcategory_name?: string;
  brand_name?: string;
  features?: any;
  final_sale_price?: number;
  description?: string;
}

export interface SaleItem {
  inventario_id: string;
  quantity_sold: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentDetail {
  payment_method: string;
  amount: number;
  notes?: string;
}

export interface CreateSaleData {
  client_id?: number;
  client_name?: string;
  items: SaleItem[];
  payment_method: string;
  payment_details?: PaymentDetail[];
  location: string;
  notes?: string;
}

export interface Sale {
  id: number;
  client_id?: number;
  client_name?: string;
  user_id: number;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  status: string;
  location: string;
  notes?: string;
  items?: any[];
  payment_details?: PaymentDetail[];
  user?: {
    first_name: string;
    last_name: string;
  };
}

// Servicio para manejar ventas
export class SalesService {
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

  // Buscar inventario disponible
  async searchInventory(params: SearchInventoryParams): Promise<{ items: InventoryItem[], total: number }> {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      console.log('Buscando inventario con params:', params);
      const response = await this.http.get<any>('/inventory/search', params);
      console.log('Respuesta de búsqueda:', response);
      
      // La respuesta viene con data y pagination
      const items = response.data || [];
      
      // Aplanar estructura y agregar descripción
      const itemsWithDescriptions = items.map((item: any) => {
        // Aplanar la estructura anidada
        const flatItem: InventoryItem = {
          id: item.id,
          quantity: item.quantity,
          location: item.location,
          created_at: item.created_at,
          updated_at: item.updated_at,
          valuation_item: item.valuation_item,
          // Campos planos para facilitar el acceso
          category_name: item.valuation_item?.category_name,
          subcategory_name: item.valuation_item?.subcategory_name,
          brand_name: item.valuation_item?.brand_name,
          features: item.valuation_item?.features,
          final_sale_price: item.valuation_item?.final_sale_price
        };
        
        // Generar descripción
        flatItem.description = this.generateDescription(flatItem);
        
        return flatItem;
      });
      
      return {
        items: itemsWithDescriptions,
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error al buscar inventario:', error);
      return { items: [], total: 0 };
    }
  }

  // Generar descripción del producto
  private generateDescription(item: InventoryItem): string {
    const subcategory = item.subcategory_name || item.valuation_item?.subcategory_name || 'Producto';
    let description = `${subcategory}`;
    
    const features = item.features || item.valuation_item?.features;
    if (features) {
      // Agregar características importantes
      if (features.modelo) description += ` ${features.modelo}`;
      if (features.tipo) description += ` ${features.tipo}`;
      if (features.talla) description += ` Talla ${features.talla}`;
      if (features.color) description += ` Color ${features.color}`;
    }
    
    const brand = item.brand_name || item.valuation_item?.brand_name;
    if (brand) {
      description += ` - ${brand}`;
    }
    
    return description;
  }

  // Crear una nueva venta
  async createSale(saleData: CreateSaleData): Promise<Sale | null> {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const response = await this.http.post<any>('/sales', saleData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear la venta');
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  }

  // Obtener ventas con filtros
  async getSales(params: any = {}): Promise<{ sales: Sale[], total: number }> {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      console.log('Obteniendo ventas con params:', params);
      const response = await this.http.get<any>('/sales', params);
      console.log('Respuesta de ventas:', response);
      
      // La respuesta viene con data y pagination
      return {
        sales: response.data || [],
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return { sales: [], total: 0 };
    }
  }

  // Obtener una venta específica
  async getSaleById(id: number): Promise<Sale | null> {
    try {
      const response = await this.http.get<any>(`/sales/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener venta:', error);
      return null;
    }
  }

  // Obtener estadísticas de ventas
  async getSalesStats(): Promise<any> {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      
      const response = await this.http.get<any>('/sales/stats');
      console.log('Respuesta de estadísticas:', response);
      
      // Las estadísticas vienen en response.data
      return response.data || {};
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        todaySales: 0,
        todayAmount: 0,
        weekSales: 0,
        weekAmount: 0,
        averageSale: 0
      };
    }
  }
}

// Utilidades
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '$0.00';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(numAmount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};