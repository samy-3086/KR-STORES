import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kr_stores_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('kr_stores_token');
      localStorage.removeItem('kr_stores_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin-login', { email, password }),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) =>
    api.get('/products', { params }),
  
  getById: (id: string) =>
    api.get(`/products/${id}`),
  
  getFeatured: () =>
    api.get('/products/featured/list'),
  
  create: (productData: any) =>
    api.post('/products', productData),
  
  update: (id: string, productData: any) =>
    api.put(`/products/${id}`, productData),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  get: () =>
    api.get('/cart'),
  
  add: (productId: string, quantity: number) =>
    api.post('/cart/add', { productId, quantity }),
  
  update: (productId: string, quantity: number) =>
    api.put(`/cart/update/${productId}`, { quantity }),
  
  remove: (productId: string) =>
    api.delete(`/cart/remove/${productId}`),
  
  clear: () =>
    api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  create: (orderData: any) =>
    api.post('/orders', orderData),
  
  getMyOrders: (params?: any) =>
    api.get('/orders/my-orders', { params }),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  getAll: (params?: any) =>
    api.get('/orders', { params }),
  
  updateStatus: (id: string, status: string, trackingNumber?: string) =>
    api.patch(`/orders/${id}/status`, { status, trackingNumber }),
};

// Delivery API
export const deliveryAPI = {
  calculateFee: (address: string, orderTotal: number) =>
    api.post('/delivery/calculate-fee', { address, orderTotal }),
  
  validateArea: (address: string) =>
    api.post('/delivery/validate-area', { address }),
  
  getSlots: (date?: string) =>
    api.get('/delivery/slots', { params: { date } }),
  
  estimateTime: (address: string) =>
    api.post('/delivery/estimate-time', { address }),
};

// Feedback API
export const feedbackAPI = {
  submit: (feedbackData: any) =>
    api.post('/feedback', feedbackData),
  
  getMyFeedback: (params?: any) =>
    api.get('/feedback/my-feedback', { params }),
  
  getAll: (params?: any) =>
    api.get('/feedback', { params }),
  
  respond: (id: string, message: string, status?: string) =>
    api.post(`/feedback/${id}/respond`, { message, status }),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/feedback/${id}/status`, { status }),
};

export default api;