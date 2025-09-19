import api from './api';
import { User } from '../types';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/api/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  async verifyToken(token: string) {
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