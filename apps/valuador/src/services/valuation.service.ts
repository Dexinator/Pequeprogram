import { HttpService } from './http.service';
import { AuthService } from './auth.service';
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
  private authService: AuthService;
  private baseEndpoint = '/valuations';
  private initialized = false;

  constructor() {
    this.http = new HttpService();
    this.authService = new AuthService();

    // Solo inicializar el token si estamos en el navegador
    this.initializeIfBrowser();
  }

  // Inicializar solo si estamos en el navegador
  private initializeIfBrowser(): void {
    if (typeof window !== 'undefined' && !this.initialized) {
      console.log('Inicializando ValuationService en el navegador');
      this.refreshAuthToken();
      this.initialized = true;
    }
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


  // Listar valuaciones con filtros y paginación
  async getValuations(params: ValuationQueryParams = {}): Promise<{ valuations: Valuation[], total: number }> {
    this.ensureAuthenticated();
    return this.http.get<{ valuations: Valuation[], total: number }>(this.baseEndpoint, params);
  }

  // Actualizar el token de autenticación
  refreshAuthToken(): void {
    console.log('🔑 ValuationService.refreshAuthToken() - Iniciando...');
    
    // Intentar obtener el token directamente de localStorage primero
    let token = null;

    if (typeof window !== 'undefined') {
      console.log('🔑 Obteniendo token directamente de localStorage...');
      token = localStorage.getItem('entrepeques_auth_token');
      console.log('🔑 Token de localStorage:', token ? `${token.substring(0, 50)}...` : 'null');
    } else {
      console.log('🔑 Window no disponible, saltando localStorage');
    }

    // Si no se encontró en localStorage, intentar obtenerlo del AuthService
    if (!token) {
      console.log('🔑 Token no encontrado en localStorage, probando AuthService...');
      token = this.authService.getToken();
      console.log('🔑 Token de AuthService:', token ? `${token.substring(0, 50)}...` : 'null');
    }

    if (token) {
      console.log('✅ Configurando token de autenticación en ValuationService');
      console.log('🔑 Token que se configurará:', `${token.substring(0, 50)}...`);
      this.http.setAuthToken(token);
      console.log('✅ Token configurado en HttpService');
    } else {
      console.warn('❌ No se encontró token de autenticación para ValuationService');
    }
  }

  // Verificar y actualizar token antes de cada llamada
  private ensureAuthenticated(): void {
    console.log('🛡️ ensureAuthenticated() - Verificando autenticación...');
    
    // Asegurar que estemos inicializados
    this.initializeIfBrowser();
    
    console.log('🛡️ Llamando a refreshAuthToken()...');
    this.refreshAuthToken();
    
    // Verificar si tenemos un token válido
    const token = this.authService.getToken();
    console.log('🛡️ Token final verificado:', token ? `${token.substring(0, 50)}...` : 'null');
    
    if (!token) {
      console.error('❌ No está autenticado para hacer la petición');
      throw new Error('No está autenticado. Por favor inicie sesión.');
    }
    
    console.log('✅ Autenticación verificada correctamente');
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
      const response = await this.http.get<{success: boolean, data: Subcategory[]}>(`/categories/${categoryId}/subcategories`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      return [];
    }
  }

  // Obtener todas las subcategorías
  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      const response = await this.http.get<{success: boolean, data: Subcategory[]}>('/categories/subcategories');
      return response.data || [];
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

  // Obtener características para ofertas
  async getOfferFeatures(subcategoryId: number): Promise<any> {
    try {
      const response = await this.http.get<{success: boolean, data: FeatureDefinition[]}>(`/categories/subcategories/${subcategoryId}/offer-features`);
      return { ok: true, json: async () => ({ data: response.data || [] }) };
    } catch (error) {
      console.error('Error al obtener características de oferta:', error);
      return { ok: false, json: async () => ({ data: [] }) };
    }
  }

  // Crear una nueva marca
  async createBrand(brandData: { name: string, subcategory_id: number, renown: string }): Promise<Brand> {
    try {
      const response = await this.http.post<{success: boolean, data: Brand}>('/brands', brandData);
      console.log('Respuesta de creación de marca:', response);
      return response.data;
    } catch (error) {
      console.error('Error al crear marca:', error);
      throw error;
    }
  }

  // ---------------- Operaciones de valuación ----------------

  // Crear un cliente
  async createClient(clientData: CreateClientDto): Promise<Client> {
    this.ensureAuthenticated();
    return this.http.post<Client>(`${this.baseEndpoint}/clients`, clientData);
  }

  // Buscar clientes
  async searchClients(term: string): Promise<Client[]> {
    this.ensureAuthenticated();
    return this.http.get<Client[]>(`${this.baseEndpoint}/clients/search`, { term });
  }

  // Obtener un cliente por ID
  async getClient(id: number): Promise<Client> {
    this.ensureAuthenticated();
    return this.http.get<Client>(`${this.baseEndpoint}/clients/${id}`);
  }

  // Crear una nueva valuación
  async createValuation(valuationData: CreateValuationDto): Promise<Valuation> {
    this.ensureAuthenticated();
    return this.http.post<Valuation>(this.baseEndpoint, valuationData);
  }

  // Obtener una valuación por ID
  async getValuation(id: number): Promise<Valuation> {
    this.ensureAuthenticated();
    return this.http.get<Valuation>(`${this.baseEndpoint}/${id}`);
  }

  // Obtener lista de valuaciones
  async getValuations(params?: ValuationQueryParams): Promise<any> {
    this.ensureAuthenticated();
    return this.http.get(`${this.baseEndpoint}`, params);
  }

  // Calcular precios para un producto individual
  async calculateValuation(data: CalculateValuationDto): Promise<ValuationCalculationResult> {
    this.ensureAuthenticated();
    return this.http.post<ValuationCalculationResult>(`${this.baseEndpoint}/calculate`, data);
  }

  // Calcular precios para múltiples productos (nuevo método)
  async calculateBatch(products: any[]): Promise<any[]> {
    this.ensureAuthenticated();
    return this.http.post<any[]>(`${this.baseEndpoint}/calculate-batch`, { products });
  }

  // Agregar item a una valuación
  async addValuationItem(valuationId: number, itemData: AddValuationItemDto): Promise<ValuationItem> {
    this.ensureAuthenticated();
    return this.http.post<ValuationItem>(`${this.baseEndpoint}/${valuationId}/items`, itemData);
  }

  // Finalizar valuación
  async finalizeValuation(id: number, data: FinalizeValuationDto): Promise<Valuation> {
    this.ensureAuthenticated();
    return this.http.put<Valuation>(`${this.baseEndpoint}/${id}/finalize`, data);
  }

  // Finalizar valuación completa (crear + insertar items + finalizar en una transacción)
  async finalizeComplete(clientId: number, products: any[], notes: string = '', cashPercentage: number = 100): Promise<Valuation> {
    this.ensureAuthenticated();
    return this.http.post<Valuation>(`${this.baseEndpoint}/finalize-complete`, {
      client_id: clientId,
      products,
      notes,
      cash_percentage: cashPercentage
    });
  }
}