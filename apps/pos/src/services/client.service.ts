import { HttpService } from './http.service';

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  identification?: string;
  store_credit?: number;
  created_at?: string;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  identification?: string;
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
}