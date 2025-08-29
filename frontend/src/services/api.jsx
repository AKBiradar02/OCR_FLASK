// frontend/src/services/api.jsx
import axios from 'axios';

/**
 * Goal:
 * - In production on Vercel, use SAME-ORIGIN calls via rewrites:
 *   set VITE_API_BASE to empty string "" and call `/api/...` directly.
 * - In development (or if you prefer explicit), set VITE_API_BASE to a full URL.
 *   We'll probe a few candidates and pick the first reachable.
 */

// Defaults
const RENDER_DEFAULT = 'https://ocr-flask-oyoc.onrender.com';
const LOCAL_FALLBACKS = ['http://localhost:5000', 'http://127.0.0.1:5000'];

// Read env (fix TS rule about mixing && and ?? with parentheses)
const envBaseRaw = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ?? '').trim();
// If empty => use relative same-origin '' (so requests go to `/api/...`), else use absolute base.
const ENV_BASE = envBaseRaw === '' ? '' : envBaseRaw;

// Small health check with timeout
const ping = async (baseUrl, timeoutMs = 4000) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const url = baseUrl ? `${baseUrl}/api/test` : `/api/test`; // same-origin when baseUrl is ''
    const res = await fetch(url, {
      method: 'GET',
      // no credentials needed for health check; avoids cookie/CORS noise
      signal: ctl.signal,
    });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    clearTimeout(t);
    return false;
  }
};

// Decide initial baseURL
let initialBaseURL = '';
let candidates = [];

if (ENV_BASE === '') {
  // Same-origin mode (recommended on Vercel with rewrites)
  initialBaseURL = ''; // axios will call `/api/...`
  candidates = [];     // no probing needed
} else {
  // Absolute mode: try env first, then Render default, then local fallbacks
  candidates = Array.from(new Set([ENV_BASE, RENDER_DEFAULT, ...LOCAL_FALLBACKS].filter(Boolean)));
  initialBaseURL = candidates[0] || RENDER_DEFAULT;
}

// Create axios instance
const api = axios.create({
  baseURL: initialBaseURL, // '' means same-origin
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // ms
});

// If using absolute URLs, probe and pick the first reachable
(async () => {
  if (candidates.length === 0) return; // same-origin path, nothing to probe

  for (const url of candidates) {
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
