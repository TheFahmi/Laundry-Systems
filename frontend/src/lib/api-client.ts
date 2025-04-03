import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { fetchAPI } from './api';

// Create base axios instance
const apiClient = axios.create({
  baseURL: '', // Empty string for relative URLs
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor for auth tokens, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add auth tokens if available (from localStorage or cookies)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error status codes
      const status = error.response.status;

      // Redirect to login on authentication errors
      if (status === 401 && typeof window !== 'undefined') {
        // Clear auth tokens
        localStorage.removeItem('token');
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }

      // Log error details
      console.error(`API Error ${status}:`, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error (No Response):', error.request);
    } else {
      // Something else happened during request setup
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Alternative to axios if needed (uses the fetchAPI from api.ts)
const fetchClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<T> => {
    return fetchAPI(url, { method: 'GET', ...options });
  },
  post: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return fetchAPI(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    });
  },
  put: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    return fetchAPI(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    });
  },
  delete: async <T>(url: string, options?: RequestInit): Promise<T> => {
    return fetchAPI(url, { method: 'DELETE', ...options });
  }
};

export { apiClient, fetchClient }; 