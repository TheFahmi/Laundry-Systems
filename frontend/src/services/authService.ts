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
      console.error('Network error - no response from server:', error.message);
      return Promise.reject(error);
    }
    
    // For invalid JWT token (401)
    if (error.response?.status === 401) {
      // Debug info - buat lebih mudah troubleshooting
      console.log('%c[401 Unauthorized Error]', 'background: red; color: white; padding: 2px 5px; border-radius: 3px;');
      console.log('Error Response Data:', error.response.data);
      console.log('Request URL:', error.config.url);
      console.log('Request Method:', error.config.method);
      console.log('Request Headers:', error.config.headers);
      
      // Cek apakah ada token
      const token = Cookies.get('token');
      console.log('Current token exists:', !!token);
      
      if (token) {
        try {
          // Decode token untuk debug (tanpa validasi)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            
            // Cek waktu expired
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = payload.exp - now;
            console.log('Token expiry time:', new Date(payload.exp * 1000).toLocaleString());
            console.log('Current time:', new Date().toLocaleString());
            console.log('Time left (seconds):', timeLeft);
            
            if (timeLeft < 0) {
              console.log('Token telah expired:', Math.abs(timeLeft), 'detik yang lalu');
              
              // Attempt to regenerate token automatically if it's expired
              console.log('Attempting to regenerate token automatically...');
              const newToken = await regenerateToken(token);
              
              if (newToken && error.config) {
                console.log('Token regenerated, retrying original request');
                
                // Update the failed request with the new token
                error.config.headers['Authorization'] = `Bearer ${newToken}`;
                
                // Try the request again with the new token
                return axios(error.config);
              } else {
                console.log('Token regeneration failed, cannot retry request');
              }
            }
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      // Sebelumnya kita akan redirect ke login, sekarang kita tambahkan property debugInfo
      // dan biarkan aplikasi menangani error tanpa redirect
      
      // Display error dialog instead of redirecting
      error.debugInfo = {
        message: "Token authentication error (401)",
        tokenExists: !!token,
        errorData: error.response.data,
        url: error.config.url
      };
      
      // Jangan redirect ke login - biarkan aplikasi menampilkan error
      return Promise.reject(error);
    }
    
    // For other errors
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
  refreshToken,
  regenerateToken
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

// Function to manually regenerate expired token
const regenerateToken = async (expiredToken: string): Promise<string | null> => {
  try {
    // Decode the expired token to get user information
    const parts = expiredToken.split('.');
    if (parts.length !== 3) {
      console.error('[Auth Service] Invalid token format for regeneration');
      return null;
    }
    
    // Parse payload without validation
    const payload = JSON.parse(atob(parts[1]));
    console.log('[Auth Service] Regenerating token for payload:', payload);
    
    if (!payload.username || (!payload.userId && !payload.sub)) {
      console.error('[Auth Service] Token payload missing required fields for regeneration');
      return null;
    }
    
    // Call the token regeneration endpoint with the expired token and user info
    const response = await axios.post('/api/auth/regenerate-token', {
      username: payload.username,
      userId: payload.userId || payload.sub,
      role: payload.role || 'user'
    }, {
      headers: {
        // Include the expired token so the server can verify the request is legitimate
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    if (response.data?.token) {
      console.log('[Auth Service] Token successfully regenerated');
      // Update stored token with the new one
      Cookies.set('token', response.data.token, { 
        expires: 14, // 14 days
        path: '/' 
      });
      return response.data.token;
    }
    
    console.log('[Auth Service] No token in regeneration response');
    return null;
  } catch (error) {
    console.error('[Auth Service] Token regeneration error:', error);
    return null;
  }
}; 