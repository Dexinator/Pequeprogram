import { HttpService } from './http.service';

export interface ClothingPrice {
  id: number;
  category_group: string;
  garment_type: string;
  quality_level: string;
  purchase_price: number;
  sale_price: number;
  is_active: boolean;
}

export interface ClothingSize {
  id: number;
  category_group: string;
  size_value: string;
  display_order: number;
}

class ClothingService {
  private http: HttpService;
  private initialized = false;

  constructor() {
    this.http = new HttpService();
    this.initializeIfBrowser();
  }

  private initializeIfBrowser(): void {
    if (typeof window !== 'undefined' && !this.initialized) {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
      this.initialized = true;
    }
  }

  private refreshToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  private handleAuthError(): void {
    if (typeof window !== 'undefined') {
      console.error('Token inválido detectado, limpiando almacenamiento local...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('entrepeques_auth_token');
      localStorage.removeItem('entrepeques_user');
      // Recargar la página para forzar nuevo login
      window.location.reload();
    }
  }
  async checkIsClothingCategory(subcategoryId: number): Promise<boolean> {
    this.refreshToken();
    try {
      const response = await this.http.get(`/clothing/check-category/${subcategoryId}`);
      return response.isClothing;
    } catch (error: any) {
      console.error('Error checking clothing category:', error);
      // Si es un error 401, limpiar el token inválido
      if (error.status === 401) {
        this.handleAuthError();
      }
      return false;
    }
  }

  async getGarmentTypes(categoryGroup: string): Promise<string[]> {
    this.refreshToken();
    try {
      const response = await this.http.get<any>(`/clothing/garment-types/${categoryGroup}`);
      // El API devuelve { status: 'success', data: [...] }
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting garment types:', error);
      if (error.status === 401) {
        this.handleAuthError();
      }
      return [];
    }
  }

  async getSizes(categoryGroup: string): Promise<ClothingSize[]> {
    this.refreshToken();
    try {
      const response = await this.http.get<any>(`/clothing/sizes/${categoryGroup}`);
      // El API devuelve { status: 'success', data: [...] }
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting sizes:', error);
      if (error.status === 401) {
        this.handleAuthError();
      }
      return [];
    }
  }

  async getClothingPrice(
    categoryGroup: string,
    garmentType: string,
    qualityLevel: string
  ): Promise<ClothingPrice | null> {
    this.refreshToken();
    try {
      const params = new URLSearchParams({
        categoryGroup,
        garmentType,
        qualityLevel
      });
      const response = await this.http.get<any>(`/clothing/price?${params}`);
      // El API devuelve { status: 'success', data: {...} }
      return response.data || null;
    } catch (error: any) {
      console.error('Error getting clothing price:', error);
      if (error.status === 401) {
        this.handleAuthError();
      }
      return null;
    }
  }

  async calculateClothingValuation(data: {
    subcategoryId: number;
    garmentType: string;
    qualityLevel: string;
    status: string;
    conditionState: string;
    demand: string;
    cleanliness: string;
  }): Promise<{
    purchasePrice: number;
    suggestedSalePrice: number;
    storeCreditPrice: number;
    consignmentPrice: number;
  }> {
    this.refreshToken();
    try {
      const response = await this.http.post('/clothing/calculate', data);
      return response;
    } catch (error: any) {
      console.error('Error calculating clothing valuation:', error);
      if (error.status === 401) {
        this.handleAuthError();
      }
      throw error;
    }
  }
}

export const clothingService = new ClothingService();