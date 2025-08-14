import axios from 'axios';

// Try multiple potential backend URLs
const tryBackendUrls = async () => {
  const urls = [
    'http://localhost:5000',
    'http://127.0.0.1:5000', 
    'http://localhost:80',
    'http://localhost:8000'
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(`${url}/api/test`, { 
        method: 'GET',
        mode: 'no-cors'
      });
      console.log(`Successfully connected to: ${url}`);
      return url;
    } catch (error) {
      console.warn(`Failed to connect to ${url}:`, error);
    }
  }
  
  console.error('Could not connect to any backend URL');
  return 'http://localhost:5000'; // default fallback
};

// Create axios instance with base URL
const API_URL = 'http://localhost:5000';  // default URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000 // 10 seconds timeout
});

// Authentication API calls
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
      console.error("Error fetching current user:", error);
      // Don't throw on auth check - just return null
      if (error.response && error.response.status === 401) {
        return null;
      }
      if (error.code === 'ERR_NETWORK') {
        console.warn('Backend server appears to be offline');
      }
      return null;
    }
  }
};

// OCR API calls
export const ocrAPI = {
  processFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    // Validate result ID before making the API call
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
    // Validate result ID before making the API call
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
  }
};

// Try to determine the best backend URL on load
(async () => {
  try {
    console.log('Testing connectivity to backend...');
    const bestUrl = await tryBackendUrls();
    if (bestUrl !== API_URL) {
      console.log(`Updating API base URL to ${bestUrl}`);
      api.defaults.baseURL = bestUrl;
    }
  } catch (error) {
    console.error('Error testing backend connectivity:', error);
  }
})();

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // You can add a token here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access, please login again');
      // Redirect to login page or dispatch logout action
    }
    return Promise.reject(error);
  }
);

export default api; 