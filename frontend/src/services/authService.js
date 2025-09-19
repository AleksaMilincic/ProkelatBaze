import api from './api';

export const authService = {
  async login(data) {
    const response = await api.post('/api/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data) {
    const response = await api.post('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  async verifyToken(token) {
    const response = await api.post('/api/auth/verify', { token });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};