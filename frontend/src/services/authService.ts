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
    // For invalid JWT token (401)
    if (error.response?.status === 401) {
      // Check for token fix suggestion
      if (error.response?.data?.fixToken && error.response?.data?.username) {
        try {
          const username = error.response.data.username;
          console.log(`[Auth] Token mismatch detected. Trying to fix token for user: ${username}`);
          
          // Use the fix-token endpoint to get a new token
          const result = await fixToken(username);
          
          if (result && result.success && error.config) {
            console.log(`[Auth] Token fixed successfully for ${username}. Retrying request...`);
            // Update the token for this request
            const newToken = result.token;
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            // Retry the request with the new token
            return axios(error.config);
          }
        } catch (fixError) {
          console.error('[Auth] Failed to fix token:', fixError);
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
    console.error('Error getting current user:', error);
    return null;
  }
};

// Function to validate token
const validateToken = async (): Promise<boolean> => {
  try {
    // Check for any available token
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (!token) {
      console.log('[Auth] No token found in cookies, validation failed');
      return false;
    }
    
    // Log that we're validating with available token
    console.log('[Auth] Validating token (first 10 chars):', token.substring(0, 10) + '...');
    
    const response = await axios.get('/api/auth/validate');
    const isValid = response.data?.valid === true;
    
    if (isValid) {
      console.log('[Auth] Token validation succeeded');
    } else {
      console.log('[Auth] Token validation failed:', response.data?.message);
    }
    
    return isValid;
  } catch (error) {
    console.error('[Auth] Error validating token:', error);
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
    console.error('Error fixing token:', error);
    return null;
  }
};

// Function to refresh the token
const refreshToken = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return false;
    }
    
    // Try to fix the token using the username
    const result = await fixToken(user.username);
    
    return !!result;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Function to login
const login = async (data: LoginRequest): Promise<LoginResponse | null> => {
  try {
    console.log('[Auth] Sending login request for user:', data.username);
    
    // Clear any existing tokens first
    await clearAuthData();
    
    // Send login request
    const response = await axios.post('/api/auth/login', data, {
      withCredentials: true
    });
    
    if (response.data && response.data.user) {
      console.log('[Auth] Login successful for:', data.username);
      
      // Store the token in js-cookie if needed (not set by API route)
      // This is a fallback in case HTTP-only cookies aren't working
      if (response.data.token) {
        // Check if js_token was already set by the API
        const jsToken = Cookies.get('js_token');
        if (!jsToken) {
          console.log('[Auth] Setting token in js-cookie as fallback');
          Cookies.set('token', response.data.token, { 
            expires: 14, // 14 days
            path: '/' 
          });
        } else {
          console.log('[Auth] js_token already set by API, using that');
        }
      }
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } else {
      console.error('[Auth] Login response missing user data.');
      return null;
    }
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Function to register
const register = async (username: string, password: string, email: string, name: string): Promise<any> => {
  try {
    console.log('[Auth] Sending registration request for:', username);
    
    const response = await axios.post('/api/auth/register', {
      username,
      password,
      email,
      name
    });
    
    if (response.data) {
      console.log('[Auth] Registration successful for:', username);
      return response.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('[Auth] Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Clear all auth-related data
const clearAuthData = async (): Promise<void> => {
  try {
    // Only clear cookies via API if token exists - prevents unnecessary calls on page refresh
    const token = Cookies.get('token') || Cookies.get('js_token');
    if (token) {
      console.log('[Auth] Clearing auth data via API call');
      await axios.post('/api/auth/clear-cookies');
    } else {
      console.log('[Auth] No token present, skipping API call for cookie clearing');
    }
  } catch (error) {
    console.error('[Auth] Error clearing cookies via API:', error);
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
    console.log('[Auth] Logging out user');
    
    // Check if token exists before making logout API call
    const token = Cookies.get('token');
    if (token) {
      // Call logout endpoint to clear server-side cookies
      await axios.post('/api/auth/logout');
    } else {
      console.log('[Auth] No token found, skipping logout API call');
    }
  } catch (error) {
    console.error('[Auth] Logout API error:', error);
  }
  
  // Clear client-side data
  await clearAuthData();
};

// Force logout without calling API
const forceLogout = async (): Promise<void> => {
  console.log('[Auth] Force logout executed');
  await clearAuthData();
  
  // Broadcast an auth error event
  if (typeof window !== 'undefined') {
    const event = new Event('auth:error');
    window.dispatchEvent(event);
  }
};

// Export functions
export const authService = {
  login,
  register,
  logout,
  forceLogout,
  validateToken,
  getCurrentUser,
  refreshToken,
  clearAuthData
}; 