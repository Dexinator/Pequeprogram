import { httpService } from './http.service';
import { authService } from './auth.service';

export interface ClothingPrice {
  id: number;
  category_group: string;
  garment_type: string;
  quality_level: string;
  purchase_price: number;
  is_active: boolean;
}

export interface ClothingSize {
  id: number;
  category_group: string;
  size_value: string;
  display_order: number;
}

export interface ClothingCheckResponse {
  isClothing: boolean;
  categoryGroup: string | null;
}

export interface ClothingValuationResult {
  purchasePrice: number;
  suggestedSalePrice: number;
  storeCreditPrice: number;
  consignmentPrice: number;
}

class ClothingService {
  constructor() {
    // No inicializar el token aquí para evitar errores de importación circular
  }

  // Actualizar el token de autenticación en las cabeceras HTTP
  private refreshAuthToken() {
    const token = authService.getToken();
    if (token) {
      httpService.setAuthToken(token);
    }
  }

  // Asegurar que el usuario esté autenticado antes de hacer peticiones
  private ensureAuthenticated() {
    this.refreshAuthToken();
    if (!authService.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }
  }
  async checkIfClothingCategory(subcategoryId: number): Promise<ClothingCheckResponse> {
    try {
      this.ensureAuthenticated();
      const response = await httpService.get(`/clothing/check-category/${subcategoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking clothing category:', error);
      throw error;
    }
  }

  async getGarmentTypes(categoryGroup: string): Promise<string[]> {
    try {
      this.ensureAuthenticated();
      const response = await httpService.get(`/clothing/garment-types/${categoryGroup}`);
      return response.data;
    } catch (error) {
      console.error('Error getting garment types:', error);
      throw error;
    }
  }

  async getClothingSizes(categoryGroup: string): Promise<ClothingSize[]> {
    try {
      this.ensureAuthenticated();
      const response = await httpService.get(`/clothing/sizes/${categoryGroup}`);
      return response.data;
    } catch (error) {
      console.error('Error getting clothing sizes:', error);
      throw error;
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
  }): Promise<ClothingValuationResult> {
    try {
      this.ensureAuthenticated();
      const response = await httpService.post('/clothing/calculate', data);
      return response.data;
    } catch (error) {
      console.error('Error calculating clothing valuation:', error);
      throw error;
    }
  }
}

export const clothingService = new ClothingService();