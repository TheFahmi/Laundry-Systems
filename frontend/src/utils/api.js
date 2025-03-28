import axios from 'axios';
import Cookies from 'js-cookie';
import { getToken } from '@/api/auth';

// Create an axios instance
const api = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : '/api',
  timeout: 10000,
  withCredentials: true, // Important for CSRF cookie handling
});

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    // Get JWT token using the resilient getter function
    const token = getToken();
    if (!token) {
      console.warn('Cannot fetch CSRF token: No JWT token available');
      return null;
    }

    console.log('Fetching CSRF token via Next.js proxy...');
    
    try {
      // Use fetch directly (NOT the api instance) to avoid circular dependency
      // The api instance would try to add a CSRF token that we don't have yet
      const response = await fetch(`/api/auth/csrf-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch CSRF token: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.data && data.data.csrfToken) {
        console.log('CSRF token fetched successfully via proxy');
        sessionStorage.setItem('csrfToken', data.data.csrfToken);
        return data.data.csrfToken;
      } else if (data && data.csrfToken) {
        console.log('CSRF token fetched successfully via proxy');
        sessionStorage.setItem('csrfToken', data.csrfToken);
        return data.csrfToken;
      }
      
      console.warn('Failed to get CSRF token from proxy response', data);
      return null;
    } catch (error) {
      console.error('Failed to fetch CSRF token via proxy:', error);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Initialize CSRF token on app load
const initializeCsrf = async () => {
  if (typeof window !== 'undefined') {
    if (!sessionStorage.getItem('csrfToken') && Cookies.get('token')) {
      console.log('Initializing CSRF token');
      await fetchCsrfToken();
    }
  }
};

// Call the initialization function
initializeCsrf();

// Function to ensure we have a CSRF token
const ensureCsrfToken = async () => {
  // Don't attempt to fetch CSRF token on server-side
  if (typeof window === 'undefined') return null;
  
  const token = getToken();
  if (!token) return null;
  
  let csrfToken = sessionStorage.getItem('csrfToken');
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  return csrfToken;
};

// Add a request interceptor to add JWT and CSRF tokens to requests
api.interceptors.request.use(
  async (config) => {
    // Get JWT token using the resilient getter function
    const token = getToken();
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Always include CSRF token for ALL requests (including GET)
    const csrfToken = await ensureCsrfToken();
    
    // Add CSRF token to the headers if available
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
      console.log(`Added CSRF token to ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`No CSRF token available for ${config.method.toUpperCase()} ${config.url}`);
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
      console.error('Unauthorized (401) error:', error.response.data);
      // Clear auth data
      Cookies.remove('token');
      sessionStorage.removeItem('csrfToken');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors (e.g., invalid CSRF token)
    if (error.response && error.response.status === 403) {
      console.error('Forbidden (403) error:', error.response.data);
      
      const token = Cookies.get('token');
      if (token) {
        console.log('Trying to refresh CSRF token after 403 error');
        // Clear CSRF token to fetch a new one
        sessionStorage.removeItem('csrfToken');
        
        // Try to get a new CSRF token
        const newToken = await fetchCsrfToken();
        
        // Retry the request if possible
        if (newToken && error.config) {
          console.log('Retrying request with new CSRF token');
          // Update the request with the new token
          error.config.headers['X-CSRF-Token'] = newToken;
          return api(error.config);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication functions
export const authApi = {
  login: async (username, password) => {
    try {
      // First, try to get a CSRF token for the login request
      // This is a special case since we're not authenticated yet
      try {
        // Use our proxy endpoint to avoid CORS issues
        await api.get('/auth/csrf-token');
      } catch (error) {
        console.warn('Failed to fetch CSRF token before login', error);
        // Continue anyway as the login endpoint is public
      }

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
        
        // Get a fresh CSRF token after login
        await fetchCsrfToken();
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
    sessionStorage.removeItem('csrfToken');
  },
  
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },
  
  // Method to get CSRF token
  getCsrfToken: async () => {
    return fetchCsrfToken();
  }
};

// Export the API instance to use for all requests
export default api;

// Export the fetchCsrfToken function for explicit use
export const getCsrfToken = fetchCsrfToken; 