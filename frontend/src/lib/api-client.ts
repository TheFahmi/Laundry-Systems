import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { fetchAPI } from './api';

// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor for auth tokens, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You could add auth tokens here if needed
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
      // Log or handle specific error status codes
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else {
      console.error('API Request Error:', error.message);
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