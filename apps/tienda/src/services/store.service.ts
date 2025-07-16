import { httpService } from './http.service';

export interface PendingProduct {
  id: number;
  inventory_id: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string;
  status: string;
  condition_state: string;
  features: Record<string, any>;
  final_sale_price: number;
  quantity: number;
  location: string;
  images?: string[];
}

export interface ProductForPreparation extends PendingProduct {
  suggested_online_price: number;
}

export interface PrepareProductData {
  weight_grams: number;
  images: string[];
  online_price: number;
}

export interface StoreStats {
  pending_products: number;
  online_products: number;
  prepared_today: number;
  prepared_week: number;
  total_inventory_value: number;
}

export class StoreService {
  private http = httpService;
  
  constructor() {
    // Verificar si hay token guardado al crear el servicio
    this.initializeAuth();
  }
  
  private initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        console.log('🔑 StoreService: Token encontrado, configurando...');
        this.http.setAuthToken(token);
      }
    }
  }

  // Obtener productos pendientes de preparación
  async getPendingProducts(params?: {
    page?: number;
    limit?: number;
    location?: string;
    category_id?: number;
    subcategory_id?: number;
  }): Promise<{
    products: PendingProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      console.log('Obteniendo productos pendientes...', params);
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      const response = await this.http.get('/store/products/pending', params);
      
      console.log('Productos pendientes obtenidos:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener productos pendientes:', error);
      throw error;
    }
  }

  // Obtener detalles de un producto para preparación
  async getProductForPreparation(inventoryId: string): Promise<ProductForPreparation> {
    try {
      console.log('Obteniendo producto para preparación:', inventoryId);
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      const response = await this.http.get(`/store/products/${inventoryId}/prepare`);
      
      console.log('Producto obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  }

  // Preparar producto para tienda online
  async prepareProductForStore(inventoryId: string, data: PrepareProductData): Promise<any> {
    try {
      console.log('Preparando producto para tienda:', inventoryId, data);
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      const response = await this.http.put(`/store/products/${inventoryId}/prepare`, data);
      
      console.log('Producto preparado:', response);
      return response.data;
    } catch (error) {
      console.error('Error al preparar producto:', error);
      throw error;
    }
  }

  // Obtener estadísticas de la tienda
  async getStoreStats(): Promise<StoreStats> {
    try {
      console.log('Obteniendo estadísticas de la tienda...');
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      const response = await this.http.get('/store/stats');
      
      console.log('Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Subir imagen a S3 a través del backend
  async uploadImage(file: File, inventoryId: string): Promise<string> {
    try {
      console.log('Subiendo imagen:', file.name);
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('images', file);
      formData.append('inventoryId', inventoryId);
      
      // Hacer la petición al backend
      const response = await fetch(`${this.http.getBaseUrl()}/store/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('entrepeques_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir imagen');
      }

      const result = await response.json();
      console.log('Imagen subida:', result);
      
      // Retornar la URL de la primera imagen
      if (result.images && result.images.length > 0) {
        return result.images[0].url;
      }
      
      throw new Error('No se recibió URL de imagen');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }
  
  // Subir múltiples imágenes
  async uploadImages(files: File[], inventoryId: string): Promise<string[]> {
    try {
      console.log('Subiendo múltiples imágenes:', files.length);
      
      // Verificar token antes de la petición
      this.initializeAuth();
      
      // Crear FormData para enviar los archivos
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('inventoryId', inventoryId);
      
      // Hacer la petición al backend
      const response = await fetch(`${this.http.getBaseUrl()}/store/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('entrepeques_auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir imágenes');
      }

      const result = await response.json();
      console.log('Imágenes subidas:', result);
      
      // Retornar las URLs de las imágenes
      return result.images.map((img: any) => img.url);
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw error;
    }
  }
}

// Exportar instancia por defecto
export const storeService = new StoreService();