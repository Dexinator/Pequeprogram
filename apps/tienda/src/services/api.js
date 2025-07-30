// API service for Tienda app
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('API URL configured:', API_URL);

// Helper function for fetch requests
async function fetchApi(endpoint, options = {}) {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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