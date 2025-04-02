import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginRequest, LoginResponse, User } from '@/api/auth';

// Base URL for API requests - always use relative URLs to ensure Next.js API routes are used
const API_URL = '';  // Empty string means relative URLs

// Setup axios request interceptor for adding tokens
axios.interceptors.request.use(
  (config) => {
    // Add JWT token from cookies - try both token types
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure credentials are included with the request
    config.withCredentials = true;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Setup axios response interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if there's a response from the server
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // For invalid JWT token (401)
    if (error.response?.status === 401) {
      console.log('[Axios] Received 401 error:', error.response.data);
      
      // Handle tokenExpired flag specifically
      if (error.response?.data?.tokenExpired) {
        console.log('[Axios] Token expired flag detected, attempting refresh');
        try {
          // Try to refresh the token using our enhanced function
          const refreshed = await refreshToken();
          
          if (refreshed && error.config) {
            console.log('[Axios] Token refreshed successfully, retrying request');
            // Get the latest token
            const newToken = Cookies.get('token');
            // Update the Authorization header with the new token
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            // Mark as retried to prevent infinite loops
            error.config._isRetry = true;
            // Retry the request with the new token
            return axios(error.config);
          } else {
            console.log('[Axios] Token refresh failed, logging out');
            // Force logout and redirect to login page
            await forceLogout();
            return Promise.reject(new Error('Authentication failed. Please log in again.'));
          }
        } catch (refreshError) {
          console.error('[Axios] Error during token refresh:', refreshError);
          // Force logout and redirect
          await forceLogout();
          return Promise.reject(new Error('Authentication failed. Please log in again.'));
        }
      }
      
      // Check for token fix suggestion
      if (error.response?.data?.fixToken && error.response?.data?.username) {
        try {
          const username = error.response.data.username;
          
          // Use the fix-token endpoint to get a new token
          const result = await fixToken(username);
          
          if (result && result.success && error.config) {
            // Update the token for this request
            const newToken = result.token;
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            // Retry the request with the new token
            return axios(error.config);
          }
        } catch (fixError) {
          // Force logout as fallback
          await forceLogout();
          return Promise.reject(new Error('Token fix failed. Please log in again.'));
        }
      }
      
      // Special handling for redirectToLogin property
      if (error.response?.data?.redirectToLogin) {
        // Force logout and redirect
        await forceLogout();
        return Promise.reject(error);
      }
      
      // Check if we can refresh the token
      if (error.config && !error.config._isRetry) {
        try {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (refreshed) {
            // Mark as retried to prevent infinite loops
            error.config._isRetry = true;
            // Retry the original request
            return axios(error.config);
          } else {
            // Force logout and redirect to login page
            await forceLogout();
            return Promise.reject(new Error('Authentication failed. Please log in again.'));
          }
        } catch (refreshError) {
          // Force logout and redirect
          await forceLogout();
          return Promise.reject(new Error('Authentication failed. Please log in again.'));
        }
      } else {
        // Token refresh failed or wasn't attempted
        // Clean up and redirect to login
        await forceLogout();
        
        // Return a rejected promise to stop the execution chain
        return Promise.reject(new Error('Authentication required. Please log in.'));
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to get current user from localStorage
const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

// Function to validate token
const validateToken = async (): Promise<boolean> => {
  try {
    // Check for any available token
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (!token) {
      return false;
    }
    
    const response = await axios.get('/api/auth/validate');
    const isValid = response.data?.valid === true;
    
    return isValid;
  } catch (error) {
    return false;
  }
};

// Function to fix token issues
const fixToken = async (username: string): Promise<any> => {
  try {
    const response = await axios.post(`/api/auth/fix-token/${username}`);
    
    if (response.data?.token) {
      // Update stored token - increase expiration to 14 days
      Cookies.set('token', response.data.token, { 
        expires: 14, // 14 days instead of 1
        path: '/' 
      });
      
      return response.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Function to refresh the token
const refreshToken = async (): Promise<boolean> => {
  try {
    console.log('[Auth Service] Attempting to refresh token');
    const user = getCurrentUser();
    
    if (!user) {
      console.log('[Auth Service] No user found for token refresh');
      return false;
    }
    
    // First try the refresh-token API endpoint
    try {
      const token = Cookies.get('token') || Cookies.get('js_token');
      if (!token) {
        console.log('[Auth Service] No token found to refresh');
        return false;
      }
      
      console.log('[Auth Service] Calling refresh token endpoint');
      const response = await axios.post('/api/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.token) {
        console.log('[Auth Service] Token successfully refreshed');
        // Update stored token with the new one
        Cookies.set('token', response.data.token, { 
          expires: 14, // 14 days
          path: '/' 
        });
        return true;
      }
    } catch (refreshError) {
      console.log('[Auth Service] Refresh token endpoint failed, falling back to fix-token');
      // If the refresh fails, try the fix-token fallback
    }
    
    // Fallback: Try to fix the token using the username
    console.log('[Auth Service] Trying to fix token using username:', user.username);
    const result = await fixToken(user.username);
    
    if (result) {
      console.log('[Auth Service] Token successfully fixed');
      return true;
    }
    
    console.log('[Auth Service] All token refresh methods failed');
    return false;
  } catch (error) {
    console.error('[Auth Service] Error refreshing token:', error);
    return false;
  }
};

// Function to login
const login = async (data: LoginRequest): Promise<LoginResponse | null> => {
  try {
    // Clear any existing tokens first
    await clearAuthData();
    
    // Send login request
    const response = await axios.post('/api/auth/login', data, {
      withCredentials: true
    });
    
    if (response.data && response.data.user) {
      // Store the token in js-cookie if needed (not set by API route)
      // This is a fallback in case HTTP-only cookies aren't working
      if (response.data.token) {
        // Check if js_token was already set by the API
        const jsToken = Cookies.get('js_token');
        if (!jsToken) {
          Cookies.set('token', response.data.token, { 
            expires: 14, // 14 days
            path: '/' 
          });
        }
      }
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Function to register
const register = async (username: string, password: string, email: string, name: string): Promise<any> => {
  try {
    const response = await axios.post('/api/auth/register', {
      username,
      password,
      email,
      name
    });
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Clear all auth-related data
const clearAuthData = async (): Promise<void> => {
  try {
    // Only clear cookies via API if token exists - prevents unnecessary calls on page refresh
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (token) {
      await axios.post('/api/auth/clear-cookies');
    }
  } catch (error) {
    // Remove console.error
  }
  
  // Clear cookies on client-side too
  Cookies.remove('token', { path: '/' });
  Cookies.remove('js_token', { path: '/' });
  Cookies.remove('auth_token', { path: '/' });
  
  // Clear localStorage
  localStorage.removeItem('user');
  
  // Clear sessionStorage
  sessionStorage.removeItem('token');
};

// Logout function
const logout = async (): Promise<void> => {
  try {
    const token = Cookies.get('token');
    if (token) {
      await axios.post('/api/auth/logout');
    }
  } catch (error) {
    // Remove console.error
  } finally {
    // Clear local storage and cookies
    await clearAuthData();
  }
};

// Force logout without calling API
const forceLogout = async (): Promise<void> => {
  await clearAuthData();
  
  // Broadcast an auth error event
  if (typeof window !== 'undefined') {
    const event = new Event('auth:error');
    window.dispatchEvent(event);
  }
};

// Export all auth-related functions
export {
  login,
  register,
  logout,
  forceLogout,
  validateToken,
  getCurrentUser,
  clearAuthData,
  fixToken,
  refreshToken
};

// Export a function for retrying requests with token fix
export const retryWithTokenFix = async <T>(
  username: string,
  originalRequest: () => Promise<T>
): Promise<T> => {
  try {
    await fixToken(username);
    return await originalRequest();
  } catch (fixError) {
    throw fixError;
  }
};

// Clear auth cookies via API
export const clearAuthCookies = async (): Promise<void> => {
  try {
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (token) {
      await axios.post('/api/auth/clear-cookies');
    }
  } catch (error) {
    // Remove console.error
  }
}; 