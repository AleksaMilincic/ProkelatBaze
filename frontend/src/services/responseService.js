import axios from 'axios';

const RESPONSES_SERVICE_URL = process.env.REACT_APP_RESPONSES_SERVICE_URL || 'http://localhost:3003';

const responseApi = axios.create({
  baseURL: RESPONSES_SERVICE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
responseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const responseService = {
  async submitResponse(formId, data) {
    const response = await responseApi.post(`/api/responses/${formId}`, data);
    return response.data;
  },

  async getResponses(formId, params) {
    const response = await responseApi.get(`/api/responses/${formId}`, { params });
    return response.data;
  },

  async getResponse(formId, responseId) {
    const response = await responseApi.get(`/api/responses/${formId}/${responseId}`);
    return response.data;
  },

  async deleteResponse(formId, responseId) {
    const response = await responseApi.delete(`/api/responses/${formId}/${responseId}`);
    return response.data;
  },

  async getAnalytics(formId) {
    const response = await responseApi.get(`/api/responses/${formId}/analytics`);
    return response.data;
  },

  async exportResponses(formId, format = 'csv') {
    const response = await responseApi.get(`/api/responses/${formId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};