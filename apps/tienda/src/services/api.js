// API service for Tienda app
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('API URL configured:', API_URL);

// Limpia la sesión guardada y redirige al login conservando la ruta actual.
// Se usa una sola vez por página: si varias peticiones fallan a la vez, la
// primera redirige y las demás ya no hacen nada.
let sessionExpiredHandled = false;
function handleSessionExpired() {
  if (typeof window === 'undefined' || sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  try {
    localStorage.removeItem('entrepeques_auth_token');
    localStorage.removeItem('entrepeques_user');
  } catch {
    // localStorage no disponible
  }
  if (!window.location.pathname.includes('/login')) {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?return=${returnTo}&expired=1`;
  }
}

// Helper function for fetch requests
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log('Fetching:', url);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Merge options
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      // Sesión vencida o inválida en una ruta protegida: limpiar y mandar al
      // login con retorno, en vez de dejar un "API Error: 401" sin salida.
      if (response.status === 401 && options.headers?.Authorization) {
        handleSessionExpired();
        throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
      }

      // Intentar recuperar el mensaje que manda el API (ej. validaciones 400)
      let message = `API Error: ${response.status} ${response.statusText}`;
      try {
        const body = await response.json();
        if (body && (body.message || body.error)) {
          message = body.message || body.error;
        }
      } catch {
        // sin cuerpo JSON: se queda el mensaje genérico
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Category services
export const categoryService = {
  // Get all categories with product counts
  async getCategories() {
    const response = await fetchApi('/categories');
    return response.data || [];
  },

  // Get subcategories by category ID
  async getSubcategories(categoryId) {
    const response = await fetchApi(`/categories/${categoryId}/subcategories`);
    return response.data || [];
  },
};

// Store services
export const storeService = {
  // Get products ready for online store
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/store/products/ready${queryString ? `?${queryString}` : ''}`);
  },

  // Get product by ID
  async getProduct(id) {
    return fetchApi(`/store/products/${id}`);
  },

  // Get store statistics
  async getStats() {
    return fetchApi('/store/stats');
  },
};

// Inventory services
export const inventoryService = {
  // Search products in inventory
  async searchProducts(searchTerm) {
    return fetchApi(`/inventory/search?search=${encodeURIComponent(searchTerm)}`);
  },

  // Get available products
  async getAvailableProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/inventory/available${queryString ? `?${queryString}` : ''}`);
  },
};