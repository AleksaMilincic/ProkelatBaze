import axios from 'axios';

const FORM_SERVICE_URL = process.env.REACT_APP_FORM_SERVICE_URL || 'http://localhost:3002';

const formApi = axios.create({
  baseURL: FORM_SERVICE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
formApi.interceptors.request.use(
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

export const formService = {
  async getForms(params) {
    const response = await formApi.get('/api/forms', { params });
    return response.data;
  },

  async getForm(id) {
    const response = await formApi.get(`/api/forms/${id}`);
    return response.data;
  },

  async createForm(data) {
    const response = await formApi.post('/api/forms', data);
    return response.data;
  },

  async updateForm(id, data) {
    const response = await formApi.put(`/api/forms/${id}`, data);
    return response.data;
  },

  async deleteForm(id) {
    const response = await formApi.delete(`/api/forms/${id}`);
    return response.data;
  },

  async addCollaborator(formId, userId, role) {
    const response = await formApi.post(`/api/forms/${formId}/collaborators`, { userId, role });
    return response.data;
  }
};