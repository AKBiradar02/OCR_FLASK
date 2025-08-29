// frontend/src/services/api.jsx
import axios from 'axios';

// Same-origin base so cookies are first-party on Vercel.
// All requests go to "/api/..." and Vercel rewrites to Render.
const api = axios.create({
  baseURL: '',                // '' => same-origin
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

export const authAPI = {
  login: async (credentials) => (await api.post('/api/login', credentials)).data,
  logout: async () => (await api.post('/api/logout')).data,
  register: async (userData) => (await api.post('/api/register', userData)).data,
  getCurrentUser: async () => {
    try { return (await api.get('/api/user')).data; }
    catch (e) {
      if (e?.response?.status === 401) return null;
      throw e;
    }
  }
};

export const ocrAPI = {
  processFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await api.post('/api/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  getResults: async () => {
    try { return (await api.get('/api/results')).data?.results || []; }
    catch { return []; }
  },
  getResult: async (id) => (await api.get(`/api/results/${id}`)).data,
  deleteResult: async (id) => (await api.delete(`/api/results/${id}`)).data
};

// Optional: interceptors
api.interceptors.response.use(
  r => r,
  e => {
    if (e?.response?.status === 401) console.error('Unauthorized access, please login again');
    return Promise.reject(e);
  }
);

export default api;
