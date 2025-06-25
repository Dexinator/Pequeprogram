import { httpService } from './http.service';

export interface Product {
  id: string;
  category_id: number;
  subcategory_id: number;
  brand_id: number;
  condition_state: string;
  final_sale_price: number;
  features: Record<string, any>;
  images?: string[];
  online_store_ready: boolean;
  quantity: number;
  location?: string;
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

export class ProductsService {
  private http = httpService;

  // Obtener productos disponibles para la tienda online (público)
  async getAvailableProducts(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    subcategory_id?: number;
    brand_id?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
  }): Promise<ProductsResponse> {
    try {
      console.log('Obteniendo productos disponibles...', params);
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<ProductsResponse>('/products/store', params);
      
      console.log('Productos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  // Obtener detalle de un producto (público)
  async getProductDetail(id: string): Promise<Product> {
    try {
      console.log('Obteniendo detalle del producto:', id);
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<Product>(`/products/store/${id}`);
      
      console.log('Detalle del producto obtenido:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener detalle del producto:', error);
      throw error;
    }
  }

  // Buscar productos (público)
  async searchProducts(query: string): Promise<ProductsResponse> {
    try {
      console.log('Buscando productos:', query);
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<ProductsResponse>('/products/search', {
        q: query,
        online_only: true
      });
      
      console.log('Resultados de búsqueda:', response);
      return response;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  // Obtener categorías disponibles (público)
  async getCategories(): Promise<any[]> {
    try {
      console.log('Obteniendo categorías...');
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<any[]>('/categories');
      
      console.log('Categorías obtenidas:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  // Obtener subcategorías de una categoría (público)
  async getSubcategories(categoryId: number): Promise<any[]> {
    try {
      console.log('Obteniendo subcategorías de la categoría:', categoryId);
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<any[]>(`/categories/${categoryId}/subcategories`);
      
      console.log('Subcategorías obtenidas:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      throw error;
    }
  }

  // Obtener marcas de una subcategoría (público)
  async getBrands(subcategoryId: number): Promise<any[]> {
    try {
      console.log('Obteniendo marcas de la subcategoría:', subcategoryId);
      
      // Este endpoint es público, no requiere autenticación
      const response = await this.http.get<any[]>(`/brands/subcategory/${subcategoryId}`);
      
      console.log('Marcas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      throw error;
    }
  }
}

// Exportar instancia por defecto
export const productsService = new ProductsService();