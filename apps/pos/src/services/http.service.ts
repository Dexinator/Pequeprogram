// Servicio HTTP base para comunicación con el backend
export class HttpService {
  private baseUrl: string;
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl = 'http://localhost:3001/api') {
    // Forzar la inclusión de PUBLIC_API_URL en el bundle de producción
    // Esta línea evita que Vite elimine la variable durante el tree-shaking
    const _publicApiUrl = import.meta.env.PUBLIC_API_URL;
    
    // Intentar obtener la URL de la API desde las variables de entorno
    // Solo si estamos en un entorno de navegador
    if (typeof window !== 'undefined') {
      try {
        // Usar la variable que ya capturamos arriba
        const envUrl = _publicApiUrl;
        if (envUrl) {
          baseUrl = envUrl;
        }
      } catch (error) {
        console.warn('Error al obtener la URL de la API desde las variables de entorno:', error);
      }
    }

    console.log('API URL:', baseUrl); // Para depuración
    this.baseUrl = baseUrl;
  }

  // Configurar el token de autenticación
  setAuthToken(token: string) {
    console.log('🔧 HttpService.setAuthToken() - Configurando token...');
    console.log('🔧 Token recibido:', `${token.substring(0, 50)}...`);
    
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    console.log('🔧 Headers después de configurar token:', this.headers);
    console.log('✅ Token configurado en headers HTTP');
  }

  // Quitar el token de los headers (sesión cerrada o vencida)
  clearAuthToken() {
    const { Authorization, ...rest } = this.headers as Record<string, string>;
    this.headers = rest;
  }

  // Obtener la URL base
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Verificar si estamos en un entorno de navegador
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
  }

  /**
   * Convierte una respuesta no-OK en un Error con `status`, `code` y `data`
   * (el cuerpo que mandó el API). Centraliza lo que antes hacía cada método a
   * su manera: PUT/DELETE ni siquiera leían el cuerpo, así que un 400 con
   * mensaje claro llegaba como "Error en la petición: 400 Bad Request".
   *
   * Un 401 en una petición autenticada significa sesión vencida a media
   * jornada (el JWT dura 24h): se limpia la sesión y se recarga para que el
   * AuthGuard muestre el login, en vez de dejar al usuario con "error de API".
   */
  private async toError(response: Response, method: string, endpoint: string): Promise<Error> {
    let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;
    let errorBody: any = null;

    try {
      errorBody = await response.json();
      if (errorBody && (errorBody.message || errorBody.error)) {
        errorMessage = errorBody.message || errorBody.error;
      }
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        // Usar mensaje genérico si todo falla
      }
    }

    console.error(`❌ Error en petición ${method} ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });

    const hasAuth = 'Authorization' in (this.headers as Record<string, string>);
    if (response.status === 401 && hasAuth) {
      this.handleSessionExpired();
      errorMessage = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }

    const error = new Error(errorMessage) as Error & { status?: number; statusText?: string; code?: string; data?: any };
    error.status = response.status;
    error.statusText = response.statusText;
    if (errorBody && typeof errorBody === 'object') {
      error.code = errorBody.code;
      error.data = errorBody.data;
    }
    return error;
  }

  private sessionExpiredHandled = false;
  private handleSessionExpired() {
    if (typeof window === 'undefined' || this.sessionExpiredHandled) return;
    this.sessionExpiredHandled = true;
    try {
      localStorage.removeItem('entrepeques_auth_token');
      localStorage.removeItem('entrepeques_user');
    } catch {
      // localStorage no disponible
    }
    this.clearAuthToken();
    // Pequeña espera para que el error alcance a mostrarse antes de recargar
    setTimeout(() => window.location.reload(), 1500);
  }

  // Método GET genérico
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    console.log(`📡 GET ${endpoint} - Iniciando petición...`);
    
    // Verificar si estamos en un entorno de navegador
    if (!this.isBrowser()) {
      console.warn('Intentando hacer una petición GET en el servidor');
      return {} as T;
    }

    // Construir query string si hay parámetros
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';

    const fullUrl = `${this.baseUrl}${endpoint}${queryString}`;
    console.log(`📡 URL completa: ${fullUrl}`);
    console.log(`📡 Headers que se enviarán:`, this.headers);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.headers,
    });

    console.log(`📡 Respuesta recibida:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw await this.toError(response, 'GET', endpoint);
    }

    const data = await response.json();
    console.log(`✅ Datos recibidos de ${endpoint}:`, data);
    return data;
  }

  // Método POST genérico
  async post<T>(endpoint: string, data: any): Promise<T> {
    // Verificar si estamos en un entorno de navegador
    if (!this.isBrowser()) {
      console.warn('Intentando hacer una petición POST en el servidor');
      return {} as T;
    }

    console.log(`Realizando petición POST a ${this.baseUrl}${endpoint}`, {
      data,
      headers: this.headers
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      console.log(`Respuesta recibida de ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });

      if (!response.ok) {
        throw await this.toError(response, 'POST', endpoint);
      }

      const responseData = await response.json();
      console.log(`Datos recibidos de ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error en la petición POST a ${endpoint}:`, error);
      throw error;
    }
  }

  // Método PUT genérico
  async put<T>(endpoint: string, data: any): Promise<T> {
    // Verificar si estamos en un entorno de navegador
    if (!this.isBrowser()) {
      console.warn('Intentando hacer una petición PUT en el servidor');
      return {} as T;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.toError(response, 'PUT', endpoint);
    }

    return response.json();
  }

  // Método DELETE genérico
  async delete<T>(endpoint: string): Promise<T> {
    // Verificar si estamos en un entorno de navegador
    if (!this.isBrowser()) {
      console.warn('Intentando hacer una petición DELETE en el servidor');
      return {} as T;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw await this.toError(response, 'DELETE', endpoint);
    }

    return response.json();
  }
}

// Exportar una instancia por defecto
export const httpService = new HttpService();