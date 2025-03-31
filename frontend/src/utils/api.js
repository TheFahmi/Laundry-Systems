import axios from 'axios';
import Cookies from 'js-cookie';
import { getToken } from '@/api/auth';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001', // Direct to backend instead of /api proxy
  timeout: 10000,
  withCredentials: true, // Important for cookies handling
});

// Add a request interceptor to add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    // Get JWT token using the resilient getter function
    const token = getToken();
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (e.g., expired token)
    if (error.response && error.response.status === 401) {
      // Clear auth data
      Cookies.remove('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication functions
export const authApi = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Store the JWT token in cookies
      if (response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict'
        });
        
        // Also store token backup in localStorage
        localStorage.setItem('token_backup', response.data.token);
        
        // Store user data in localStorage
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
  },
  
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
};

// Export the API instance to use for all requests
export default api; 