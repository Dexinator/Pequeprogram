import { HttpService } from './http.service';

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  identification?: string;
  notes?: string | null;
  store_credit?: number;
  created_at?: string;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  identification?: string;
  notes?: string;
}

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  with_credit?: boolean;
  sort_by?: 'name' | 'credit' | 'created';
  sort_dir?: 'asc' | 'desc';
}

export interface ClientSummary {
  client_id: number;
  store_credit: number;
  purchases_count: number;
  purchases_total: number;
  last_purchase_date: string | null;
  valuations_count: number;
  valuations_total: number;
  consignments_count: number;
  consignments_unpaid: number;
}

// Servicio para manejar clientes
export class ClientService {
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

  // Método para asegurar que el token esté actualizado
  private ensureTokenIsSet(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  /** Listado paginado para la pantalla de Clientes. */
  async listClients(params: ListClientsParams = {}): Promise<{ clients: Client[]; total: number; pages: number }> {
    try {
      this.ensureTokenIsSet();
      const query: Record<string, any> = {};
      if (params.page) query.page = params.page;
      if (params.limit) query.limit = params.limit;
      if (params.search) query.search = params.search;
      if (params.with_credit) query.with_credit = true;
      if (params.sort_by) query.sort_by = params.sort_by;
      if (params.sort_dir) query.sort_dir = params.sort_dir;

      const response = await this.http.get<any>('/clients', query);
      return {
        clients: response?.data || [],
        total: response?.pagination?.total || 0,
        pages: response?.pagination?.pages || 0
      };
    } catch (error) {
      console.error('Error al listar clientes:', error);
      throw error;
    }
  }

  /** Contadores para el encabezado de la ficha (una llamada en vez de cinco). */
  async getClientSummary(id: number): Promise<ClientSummary | null> {
    try {
      this.ensureTokenIsSet();
      const response = await this.http.get<any>(`/clients/${id}/summary`);
      return response?.data || null;
    } catch (error) {
      console.error('Error al obtener el resumen del cliente:', error);
      return null;
    }
  }

  // Buscar clientes
  async searchClients(query: string): Promise<Client[]> {
    try {
      this.ensureTokenIsSet();
      const response = await this.http.get<any>('/clients/search', { q: query });
      return response.data || [];
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      return [];
    }
  }

  // Obtener un cliente por ID
  async getClientById(id: number): Promise<Client | null> {
    try {
      this.ensureTokenIsSet();
      const response = await this.http.get<any>(`/clients/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return null;
    }
  }

  // Crear un nuevo cliente
  async createClient(clientData: CreateClientData): Promise<Client | null> {
    try {
      this.ensureTokenIsSet();
      const response = await this.http.post<any>('/clients', clientData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear el cliente');
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  }

  // Actualizar un cliente
  async updateClient(id: number, clientData: Partial<CreateClientData>): Promise<Client | null> {
    try {
      this.ensureTokenIsSet();
      const response = await this.http.put<any>(`/clients/${id}`, clientData);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Error al actualizar el cliente');
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  }

  async adjustStoreCredit(
    id: number,
    amount: number,
    reason: string,
    notes?: string
  ): Promise<{ previous_balance: number; new_balance: number; adjustment: number }> {
    this.ensureTokenIsSet();
    const response = await this.http.post<any>(`/clients/${id}/store-credit/adjust`, {
      amount,
      reason,
      notes: notes || undefined,
    });
    if (!response?.success) {
      throw new Error(response?.message || 'No se pudo ajustar el saldo');
    }
    return response.data;
  }

  async getStoreCreditMovements(id: number): Promise<any[]> {
    this.ensureTokenIsSet();
    const response = await this.http.get<any>(`/clients/${id}/store-credit/movements`);
    return response?.data || [];
  }
}

export const clientService = new ClientService();
