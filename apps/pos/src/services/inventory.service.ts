import { HttpService } from './http.service';

export interface InventoryProduct {
  id: string;
  quantity: number;
  location: string;
  created_at: string;
  updated_at: string;
  valuation_item_id?: number;
  valuation_item?: {
    id: number;
    valuation_id: number;
    category_id: number;
    subcategory_id: number;
    brand_id: number;
    status: string;
    brand_renown: string;
    modality: string;
    condition_state: string;
    demand: string;
    cleanliness: string;
    features: any;
    new_price: number;
    purchase_score: number;
    sale_score: number;
    suggested_purchase_price: number;
    suggested_sale_price: number;
    final_purchase_price: number;
    final_sale_price: number;
    consignment_price: number;
    store_credit_price: number;
    images?: string[];
    notes?: string;
    online_store_ready: boolean;
    category_name?: string;
    subcategory_name?: string;
    brand_name?: string;
  };
  // Campos aplanados para facilitar acceso
  category_name?: string;
  subcategory_name?: string;
  brand_name?: string;
  final_sale_price?: number;
  description?: string;
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

export interface InventoryStats {
  total_items: number;
  total_quantity: number;
  total_value: number;
  by_location: {
    location: string;
    quantity: number;
    value: number;
  }[];
  by_category: {
    category_name: string;
    quantity: number;
    value: number;
  }[];
}

export class InventoryService {
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

  // Buscar productos en inventario
  async searchInventory(filters: InventoryFilters = {}): Promise<{ items: InventoryProduct[], total: number }> {
    try {
      // Actualizar token antes de la petición
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      const params: Record<string, any> = {};
      if (filters.q) params.q = filters.q;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
      if (filters.location) params.location = filters.location;
      if (filters.available_only !== undefined) params.available_only = filters.available_only;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await this.http.get<any>('/inventory/search', params);
      
      // Aplanar estructura y agregar descripción
      const items = (response.data || []).map((item: any) => {
        const flatItem: InventoryProduct = {
          ...item,
          category_name: item.valuation_item?.category_name,
          subcategory_name: item.valuation_item?.subcategory_name,
          brand_name: item.valuation_item?.brand_name,
          final_sale_price: item.valuation_item?.final_sale_price,
          description: this.generateDescription(item)
        };
        return flatItem;
      });

      return {
        items,
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error al buscar inventario:', error);
      return { items: [], total: 0 };
    }
  }

  // Obtener un producto específico con toda su información
  async getProduct(id: string): Promise<InventoryProduct | null> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      // Usar la búsqueda con el ID específico
      const response = await this.searchInventory({ q: id, limit: 1 });
      
      if (response.items.length > 0 && response.items[0].id === id) {
        return response.items[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  }

  // Obtener estadísticas del inventario
  async getStats(): Promise<InventoryStats> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      // Por ahora calcularemos las estadísticas del lado del cliente
      // En el futuro se puede crear un endpoint específico
      const allItems = await this.searchInventory({ limit: 1000 });
      
      const stats: InventoryStats = {
        total_items: allItems.total,
        total_quantity: 0,
        total_value: 0,
        by_location: [],
        by_category: []
      };

      const locationMap = new Map<string, { quantity: number, value: number }>();
      const categoryMap = new Map<string, { quantity: number, value: number }>();

      allItems.items.forEach(item => {
        const quantity = item.quantity || 0;
        const value = (item.final_sale_price || 0) * quantity;

        stats.total_quantity += quantity;
        stats.total_value += value;

        // Por ubicación
        const location = item.location || 'Sin ubicación';
        if (!locationMap.has(location)) {
          locationMap.set(location, { quantity: 0, value: 0 });
        }
        const locData = locationMap.get(location)!;
        locData.quantity += quantity;
        locData.value += value;

        // Por categoría
        const category = item.category_name || 'Sin categoría';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { quantity: 0, value: 0 });
        }
        const catData = categoryMap.get(category)!;
        catData.quantity += quantity;
        catData.value += value;
      });

      // Convertir mapas a arrays
      stats.by_location = Array.from(locationMap.entries()).map(([location, data]) => ({
        location,
        ...data
      }));

      stats.by_category = Array.from(categoryMap.entries()).map(([category_name, data]) => ({
        category_name,
        ...data
      }));

      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de inventario:', error);
      return {
        total_items: 0,
        total_quantity: 0,
        total_value: 0,
        by_location: [],
        by_category: []
      };
    }
  }

  // Generar descripción del producto
  private generateDescription(item: InventoryProduct): string {
    // Si es un producto OTR, usar el nombre del producto directamente
    if (item.id && item.id.startsWith('OTRP')) {
      return item.valuation_item?.subcategory_name || item.subcategory_name || 'Otros Productos';
    }
    
    const parts = [];
    
    // Usar información aplanada o de valuation_item
    const subcategory = item.subcategory_name || item.valuation_item?.subcategory_name || 'Producto';
    parts.push(subcategory);
    
    const features = item.valuation_item?.features;
    if (features) {
      // Agregar características importantes en orden de prioridad
      if (features.modelo) parts.push(features.modelo);
      if (features.tipo) parts.push(features.tipo);
      if (features.talla) parts.push(`Talla ${features.talla}`);
      if (features.color) parts.push(features.color);
    }
    
    const brand = item.brand_name || item.valuation_item?.brand_name;
    if (brand && brand !== 'Sin marca') {
      parts.push(brand);
    }
    
    return parts.join(' - ');
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

  // Obtener el valor de estado del producto
  getConditionLabel(condition: string): string {
    const conditions: Record<string, string> = {
      'nuevo': 'Nuevo',
      'como_nuevo': 'Como Nuevo',
      'muy_bueno': 'Muy Bueno',
      'bueno': 'Bueno',
      'regular': 'Regular'
    };
    return conditions[condition] || condition;
  }

  // Obtener label de modalidad
  getModalityLabel(modality: string): string {
    const modalities: Record<string, string> = {
      'compra': 'Compra Directa',
      'credito': 'Crédito en Tienda',
      'consignacion': 'Consignación'
    };
    return modalities[modality] || modality;
  }

  // Actualizar cantidad en inventario
  async updateQuantity(id: string, quantity: number, reason?: string): Promise<InventoryProduct | null> {
    try {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }

      console.log('📦 Actualizando inventario:', { id, quantity, reason });

      const response = await this.http.put<any>(`/inventory/${id}/quantity`, {
        quantity,
        reason
      });

      console.log('📦 Respuesta del servidor:', response);

      // La respuesta puede venir en response.data
      const data = response?.data || response;

      if (data) {
        // Aplanar estructura y agregar descripción
        const flatItem: InventoryProduct = {
          ...data,
          category_name: data.valuation_item?.category_name,
          subcategory_name: data.valuation_item?.subcategory_name,
          brand_name: data.valuation_item?.brand_name,
          final_sale_price: data.valuation_item?.final_sale_price,
          description: this.generateDescription(data)
        };
        console.log('📦 Item procesado:', flatItem);
        return flatItem;
      }

      return null;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();