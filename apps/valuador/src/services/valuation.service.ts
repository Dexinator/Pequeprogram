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
  Brand
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
    return this.http.get<Category[]>('/categories');
  }
  
  // Obtener subcategorías por categoría
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    return this.http.get<Subcategory[]>(`/categories/${categoryId}/subcategories`);
  }
  
  // Obtener todas las subcategorías
  async getAllSubcategories(): Promise<Subcategory[]> {
    return this.http.get<Subcategory[]>('/categories/subcategories');
  }
  
  // ---------------- Operaciones de marcas ----------------
  
  // Obtener marcas por categoría
  async getBrands(categoryId?: number): Promise<Brand[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    return this.http.get<Brand[]>('/brands', params);
  }
} 