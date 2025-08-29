// frontend/src/services/api.jsx
import axios from 'axios';

/**
 * Resolve the best API base URL in this order:
 * 1) VITE_API_BASE (set in .env or Vercel project vars)
 * 2) Deployed Render backend
 * 3) Local dev fallbacks
 *
 * We actively probe /api/test with a short timeout and pick the first that responds.
 */
const RENDER_DEFAULT = 'https://ocr-flask-oyoc.onrender.com';
const LOCAL_FALLBACKS = ['http://localhost:5000', 'http://127.0.0.1:5000'];

const envBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE)
  ? String(import.meta.env.VITE_API_BASE).trim()
  : '';

const dedupe = (arr) => Array.from(new Set(arr.filter(Boolean)));
const CANDIDATE_URLS = dedupe([envBase, RENDER_DEFAULT, ...LOCAL_FALLBACKS]);

// Small health check for a URL with timeout & proper CORS mode
const ping = async (baseUrl, timeoutMs = 4000) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/api/test`, {
      method: 'GET',
      credentials: 'include', // match axios withCredentials
      signal: ctl.signal,
    });
    clearTimeout(t);
    // We expect JSON; even if unauthorized, server should reply 200 for /api/test
    // Treat any non-network response as "reachable".
    return res.ok || res.status < 500;
  } catch {
    clearTimeout(t);
    return false;
  }
};

// Create axios instance with a temporary base (updated after probe)
const api = axios.create({
  baseURL: CANDIDATE_URLS[0] || RENDER_DEFAULT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Resolve best base URL on load
(async () => {
  for (const url of CANDIDATE_URLS) {
    const ok = await ping(url);
    if (ok) {
      if (api.defaults.baseURL !== url) {
        console.log(`[api] Using backend: ${url}`);
        api.defaults.baseURL = url;
      }
      return;
    } else {
      console.warn(`[api] Unreachable: ${url}`);
    }
  }
  console.error('[api] No backend reachable. Using last known/default base URL.');
})();

/* =========================
   Authentication API calls
   ========================= */
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/api/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Don't throw on auth check - just return null
      if (error.response && error.response.status === 401) {
        return null;
      }
      if (error.code === 'ERR_NETWORK') {
        console.warn('Backend server appears to be offline');
      }
      return null;
    }
  },
};

/* ================
   OCR API calls
   ================ */
export const ocrAPI = {
  processFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Process file error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  getResults: async () => {
    try {
      const response = await api.get('/api/results');
      // API returns { results: [...] } so we need to extract the results array
      return response.data?.results || [];
    } catch (error) {
      console.error('Get results error:', error);
      if (error.code === 'ERR_NETWORK') {
        console.warn('Backend server appears to be offline');
      }
      return []; // Return empty array on error
    }
  },

  getResult: async (resultId) => {
    if (!resultId || resultId === 'undefined') {
      console.error('Invalid result ID provided to getResult:', resultId);
      throw new Error('Invalid result ID');
    }

    try {
      const response = await api.get(`/api/results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error(`Get result ${resultId} error:`, error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  deleteResult: async (resultId) => {
    if (!resultId || resultId === 'undefined') {
      console.error('Invalid result ID provided to deleteResult:', resultId);
      throw new Error('Invalid result ID');
    }

    try {
      const response = await api.delete(`/api/results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete result ${resultId} error:`, error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },
};

/* =========================
   Axios interceptors
   ========================= */
api.interceptors.request.use(
  (config) => {
    // Add auth token here if/when you implement it
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, please login again');
      // Optionally: redirect to login or dispatch logout
    }
    return Promise.reject(error);
  }
);

export default api;
