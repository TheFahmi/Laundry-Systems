import axios from 'axios';
import Cookies from 'js-cookie';
import { getToken } from '@/api/auth';

// Create an axios instance
const api = axios.create({
  // Use the Next.js proxy routes instead of accessing backend directly
  // This will go through our /api/orders routes for proper JWT regeneration
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Important for cookies handling
});

// Add a request interceptor to add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    console.log(`[API] Making request to: ${config.url}`);
    
    // Get JWT token using the resilient getter function
    const token = getToken();
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add a timestamp to debug the request
      config.headers['X-Request-Time'] = new Date().toISOString();
    } else {
      console.log('No token available for request:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle regenerated tokens and auth errors
api.interceptors.response.use(
  (response) => {
    // Check if this is a token regeneration response (JSON format)
    if (response.data && response.data.regenerated === true && response.data.token) {
      console.log('Received regenerated token from API (JSON)');
      
      // Store the new token in cookies
      Cookies.set('token', response.data.token, { 
        expires: 30, // 30 days
        path: '/',
        sameSite: 'Lax'
      });
      
      // Also store in localStorage as backup
      localStorage.setItem('token_backup', response.data.token);
      
      // Check if we need to redirect or reload
      const currentUrl = window.location.href;
      if (currentUrl.includes('/orders') || currentUrl.includes('/work-order')) {
        console.log('Reloading page to apply new token');
        window.location.reload();
        return response;
      }
    }
    
    // Check content type for HTML response that may contain token regeneration
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      const tokenCookie = Cookies.get('token');
      if (tokenCookie) {
        // Store token in localStorage backup if not already there
        if (!localStorage.getItem('token_backup') || 
            localStorage.getItem('token_backup') !== tokenCookie) {
          localStorage.setItem('token_backup', tokenCookie);
          console.log('Updated token backup from cookies after HTML response');
        }
      }
    }
    
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (e.g., expired token)
    if (error.response && error.response.status === 401) {
      console.log('Received 401 error from API', error.response.data);
      
      // Check if token was regenerated but still failed (needs login)
      if (error.response.data && error.response.data.needsLogin) {
        console.log('Authentication failed after token regeneration, redirecting to login');
        
        // Clear auth data
        Cookies.remove('token');
        localStorage.removeItem('token_backup');
        
        // Redirect to login page (updated to App Router path)
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }
      
      // Check if this is a debugging response (don't redirect)
      if (error.response.data && error.response.data.debug === true) {
        console.log('Received debugging response, not redirecting');
        return Promise.reject(error);
      }
      
      // Default behavior - clear token and redirect (updated to App Router path)
      console.log('Default 401 handling - redirecting to login');
      Cookies.remove('token');
      localStorage.removeItem('token_backup');
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