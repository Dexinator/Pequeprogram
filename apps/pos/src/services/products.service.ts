import { HttpService } from './http.service';

export interface Product {
  id: number;
  inventory_id: string;
  category_id: number;
  subcategory_id: number;
  brand_id: number;
  status: string;
  condition_state: string;
  features: any;
  final_sale_price: number;
  online_price: number | null;
  weight_grams: number | null;
  images: string[];
  notes: string | null;
  online_store_ready: boolean;
  online_featured: boolean;
  online_prepared_at: string | null;
  modality: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string;
  quantity: number;
  location: string;
}

export interface ProductsFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  subcategory_id?: number;
  location?: string;
  search?: string;
  has_notes?: boolean;
  online_ready?: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

class ProductsService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  private refreshToken() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Get all products with filters
  async getProducts(filters: ProductsFilters = {}): Promise<{ products: Product[], pagination: any }> {
    this.refreshToken();

    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
    if (filters.location) params.location = filters.location;
    if (filters.search) params.search = filters.search;
    if (filters.has_notes !== undefined) params.has_notes = filters.has_notes;
    if (filters.online_ready !== undefined) params.online_ready = filters.online_ready;

    const response = await this.http.get<any>('/store/products/all', params);
    return {
      products: response.products || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
    };
  }

  // Get single product for editing
  async getProductForEditing(inventoryId: string): Promise<Product | null> {
    this.refreshToken();

    try {
      const response = await this.http.get<any>(`/store/products/${inventoryId}/edit`);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  }

  // Update product notes
  async updateProductNotes(inventoryId: string, notes: string): Promise<boolean> {
    this.refreshToken();

    try {
      const response = await this.http.put<any>(`/store/products/${inventoryId}/notes`, { notes });
      return response.success || false;
    } catch (error) {
      console.error('Error al actualizar notas:', error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    this.refreshToken();

    try {
      const response = await this.http.get<any>('/categories');
      return response || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  // Get subcategories by category
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    this.refreshToken();

    try {
      const response = await this.http.get<any>(`/categories/${categoryId}/subcategories`);
      return response || [];
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      return [];
    }
  }

  // Generate product description from features
  generateDescription(product: Product): string {
    const parts = [];

    parts.push(product.subcategory_name || 'Producto');

    if (product.features) {
      if (product.features.modelo) parts.push(product.features.modelo);
      if (product.features.tipo) parts.push(product.features.tipo);
      if (product.features.talla) parts.push(`Talla ${product.features.talla}`);
      if (product.features.color) parts.push(product.features.color);
    }

    if (product.brand_name && product.brand_name !== 'Sin marca') {
      parts.push(product.brand_name);
    }

    return parts.join(' - ');
  }

  // Format currency
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

  // Get condition label
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
}

export const productsService = new ProductsService();
