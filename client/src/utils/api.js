const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('texflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data;
  },

  saveOnboarding: async (profileData) => {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save onboarding');
    return data;
  },

  // Products
  getProducts: async (queryParams = {}) => {
    const query = new URLSearchParams(queryParams).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch product detail');
    return data;
  },

  getCategoryMeta: async () => {
    const res = await fetch(`${API_BASE}/products/meta/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch metadata');
    return data;
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data;
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  },

  getBuyerOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/buyer`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch buyer orders');
    return data;
  },

  getSupplierOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/supplier`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch supplier orders');
    return data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  // AI
  aiChat: async (message, contextProduct = null) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, contextProduct })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Assistant failed');
    return data;
  },

  aiCompare: async (productIds) => {
    const res = await fetch(`${API_BASE}/ai/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Product comparison failed');
    return data;
  },

  aiOnboarding: async (role, userInput) => {
    const res = await fetch(`${API_BASE}/ai/onboarding-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userInput })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI onboarding failed');
    return data;
  }
};
