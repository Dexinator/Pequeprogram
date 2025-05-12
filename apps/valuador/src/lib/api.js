// Utilidad para llamadas a la API
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Realiza una petición a la API
 * @param {string} endpoint - Endpoint relativo sin la base URL
 * @param {Object} options - Opciones para fetch
 * @returns {Promise<any>} - Respuesta de la API
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Configuración por defecto
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Si hay un token en localStorage, lo añadimos
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // Opciones finales
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Si la respuesta no es exitosa, lanzamos un error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Si la respuesta está vacía o no es JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    
    // Intentamos parsear como JSON
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

/**
 * Métodos específicos para cada tipo de petición
 */
export const api = {
  get: (endpoint, options = {}) => apiCall(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => apiCall(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data),
    ...options 
  }),
  put: (endpoint, data, options = {}) => apiCall(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data),
    ...options 
  }),
  delete: (endpoint, options = {}) => apiCall(endpoint, { method: 'DELETE', ...options }),
}; 