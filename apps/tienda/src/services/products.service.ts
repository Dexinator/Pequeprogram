import { httpService, HttpService } from './http.service';

export interface Product {
  id: number;
  inventory_id: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  brand_id: number;
  brand_name: string;
  status: string;
  condition_state: string;
  features: Record<string, any>;
  images: string[];
  online_price: number;
  weight_grams: number;
  quantity: number;
  location: string;
  discount_percentage?: number;
  discount_valid_until?: string;
  special_offer_text?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category_id?: number;
  subcategory_id?: number;
  min_price?: number;
  max_price?: number;
  condition_state?: string;
  location?: string;
  brand_id?: number;
  features?: Record<string, any>;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc';
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  product_count?: number;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  product_count?: number;
}

export interface FeatureDefinition {
  id: number;
  subcategory_id: number;
  name: string;
  display_name: string;
  type: string;
  options?: any;
  order_index: number;
}

export class ProductsService {
  private http: HttpService;
  
  constructor() {
    // Crear una nueva instancia de HttpService y limpiar cualquier token
    this.http = new HttpService();
    // Asegurarse de que no se use autenticación para servicios públicos
    this.http.clearAuthToken();
  }

  // Obtener productos listos para la tienda online
  async getOnlineProducts(params: {
    page?: number;
    limit?: number;
    filters?: ProductFilters;
  }): Promise<ProductsResponse> {
    console.log('🛍️ ProductsService.getOnlineProducts llamado con:', params);
    try {
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 20
      };

      // Agregar filtros si existen
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'features' && typeof value === 'object') {
              // Convertir features a query params individuales
              Object.entries(value).forEach(([featureKey, featureValue]) => {
                queryParams[`feature_${featureKey}`] = featureValue;
              });
            } else {
              queryParams[key] = value;
            }
          }
        });
      }

      const response = await this.http.get('/store/products/ready', queryParams);
      console.log('✅ ProductsService: Respuesta recibida:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      throw error;
    }
  }

  // Obtener detalle de un producto
  async getProductDetail(inventoryId: string): Promise<Product> {
    console.log('🔍 ProductsService.getProductDetail llamado para:', inventoryId);
    try {
      const response = await this.http.get(`/store/products/${inventoryId}/detail`);
      console.log('✅ Detalle del producto recibido:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener detalle del producto:', error);
      // @ts-ignore
      console.error('❌ Status del error:', error.status);
      throw error;
    }
  }

  // Buscar productos
  async searchProducts(query: string, params?: {
    page?: number;
    limit?: number;
    filters?: ProductFilters;
  }): Promise<ProductsResponse> {
    try {
      const searchParams = {
        ...params,
        filters: {
          ...params?.filters,
          search: query
        }
      };
      return this.getOnlineProducts(searchParams);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  // Obtener todas las categorías
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.http.get('/categories');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  // Obtener subcategorías de una categoría
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    try {
      const response = await this.http.get(`/categories/${categoryId}/subcategories`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      throw error;
    }
  }

  // Obtener feature definitions de una subcategoría
  async getFeatureDefinitions(subcategoryId: number): Promise<FeatureDefinition[]> {
    try {
      const response = await this.http.get(`/categories/subcategories/${subcategoryId}/features`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener feature definitions:', error);
      throw error;
    }
  }

  // Obtener productos relacionados
  async getRelatedProducts(inventoryId: string, limit: number = 8): Promise<Product[]> {
    try {
      const response = await this.http.get(`/store/products/${inventoryId}/related`, { limit });
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos relacionados:', error);
      return [];
    }
  }

  // Obtener productos en oferta
  async getDiscountedProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    try {
      const response = await this.http.get('/store/products/discounted', {
        page: params?.page || 1,
        limit: params?.limit || 20
      });
      return response;
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error);
      throw error;
    }
  }

  // Obtener productos destacados para el home
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await this.http.get('/store/products/featured', { limit });
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      // Si falla, intentar obtener productos normales
      try {
        const fallback = await this.getOnlineProducts({ limit });
        return fallback.products;
      } catch {
        return [];
      }
    }
  }
}

// Exportar instancia por defecto
export const productsService = new ProductsService();