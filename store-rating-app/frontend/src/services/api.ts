import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) => api.patch('/auth/password', data),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
  getStores: (params?: any) => api.get('/admin/stores', { params }),
  createStore: (data: any) => api.post('/admin/stores', data),
};

// Stores (user)
export const storesApi = {
  getStores: (params?: any) => api.get('/stores', { params }),
  getOwnerDashboard: () => api.get('/stores/my-dashboard'),
};

// Ratings
export const ratingsApi = {
  submitRating: (storeId: number, rating: number) => api.post(`/ratings/${storeId}`, { rating }),
};

export default api;
