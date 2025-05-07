import { HttpService } from './http.service';
import type {
  Client,
  CreateClientDto,
  Valuation,
  CreateValuationDto,
  AddValuationItemDto,
  CalculateValuationDto,
  ValuationCalculationResult,
  ValuationItem,
  FinalizeValuationDto,
  ValuationQueryParams,
  Category,
  Subcategory,
  Brand,
  FeatureDefinition
} from '../types/valuation.types';

// Servicio para operaciones de valuación
export class ValuationService {
  private http: HttpService;
  private baseEndpoint = '/valuations';

  constructor() {
    this.http = new HttpService();
  }

  // ---------------- Operaciones de clientes ----------------

  // Crear o buscar un cliente
  async createClient(clientData: CreateClientDto): Promise<Client> {
    return this.http.post<Client>(`${this.baseEndpoint}/clients`, clientData);
  }

  // Buscar clientes por nombre o teléfono
  async searchClients(term: string): Promise<Client[]> {
    return this.http.get<Client[]>(`${this.baseEndpoint}/clients/search`, { term });
  }

  // Obtener un cliente por ID
  async getClient(id: number): Promise<Client> {
    return this.http.get<Client>(`${this.baseEndpoint}/clients/${id}`);
  }

  // ---------------- Operaciones de valuación ----------------

  // Crear una nueva valuación
  async createValuation(data: CreateValuationDto): Promise<Valuation> {
    return this.http.post<Valuation>(this.baseEndpoint, data);
  }

  // Obtener una valuación por ID
  async getValuation(id: number): Promise<Valuation> {
    return this.http.get<Valuation>(`${this.baseEndpoint}/${id}`);
  }

  // Calcular precio para un producto
  async calculateValuation(data: CalculateValuationDto): Promise<ValuationCalculationResult> {
    return this.http.post<ValuationCalculationResult>(`${this.baseEndpoint}/calculate`, data);
  }

  // Agregar un item a una valuación
  async addValuationItem(valuationId: number, data: AddValuationItemDto): Promise<ValuationItem> {
    return this.http.post<ValuationItem>(`${this.baseEndpoint}/${valuationId}/items`, data);
  }

  // Finalizar una valuación (completar o cancelar)
  async finalizeValuation(id: number, data: FinalizeValuationDto): Promise<Valuation> {
    return this.http.put<Valuation>(`${this.baseEndpoint}/${id}/finalize`, data);
  }

  // Listar valuaciones con filtros y paginación
  async getValuations(params: ValuationQueryParams = {}): Promise<{ valuations: Valuation[], total: number }> {
    return this.http.get<{ valuations: Valuation[], total: number }>(this.baseEndpoint, params);
  }
  
  // ---------------- Operaciones de categorías y subcategorías ----------------
  
  // Obtener todas las categorías
  async getCategories(): Promise<Category[]> {
    const response = await this.http.get<{success: boolean, data: Category[]}>('/categories');
    return response.data || [];
  }
  
  // Obtener subcategorías por categoría
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    try {
      const response = await this.http.get<Subcategory[]>(`/categories/${categoryId}/subcategories`);
      return response || [];
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      return [];
    }
  }
  
  // Obtener todas las subcategorías
  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      const response = await this.http.get<Subcategory[]>('/categories/subcategories');
      return response || [];
    } catch (error) {
      console.error('Error al obtener todas las subcategorías:', error);
      return [];
    }
  }
  
  // ---------------- Operaciones de marcas ----------------
  
  // Obtener marcas por subcategoría
  async getBrands(subcategoryId?: number): Promise<Brand[]> {
    try {
      const params = subcategoryId ? { subcategory_id: subcategoryId } : {};
      const response = await this.http.get<{success: boolean, data: Brand[]}>('/brands', params);
      console.log('Respuesta de marcas:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      return [];
    }
  }

  // ---------------- Operaciones de características ----------------
  
  // Obtener definiciones de características por subcategoría
  async getFeatureDefinitions(subcategoryId: number): Promise<FeatureDefinition[]> {
    try {
      const response = await this.http.get<{success: boolean, data: FeatureDefinition[]}>(`/categories/subcategories/${subcategoryId}/features`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener definiciones de características:', error);
      return [];
    }
  }
} 