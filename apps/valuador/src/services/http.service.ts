// Servicio HTTP base para comunicación con el backend
export class HttpService {
  private baseUrl: string;
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl = 'http://localhost:3001/api') {
    // Intentar obtener la URL de la API desde las variables de entorno
    // Solo si estamos en un entorno de navegador
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore - Ignorar error de TypeScript
        const envUrl = import.meta?.env?.PUBLIC_API_URL;
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
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Obtener la URL base
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Verificar si estamos en un entorno de navegador
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
  }

  // Método GET genérico
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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

    const response = await fetch(`${this.baseUrl}${endpoint}${queryString}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
        // Intentar obtener el mensaje de error del cuerpo de la respuesta
        let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
          console.error('Error en la respuesta:', errorData);
          throw new Error(errorMessage);
        } catch (parseError) {
          // Si no se puede parsear el cuerpo como JSON, usar el mensaje genérico
          console.error('Error al parsear la respuesta de error:', parseError);
          throw new Error(errorMessage);
        }
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
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
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
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}