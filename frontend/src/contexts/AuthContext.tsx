import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

// Define auth types
interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
  refreshToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  getToken: () => null,
  refreshToken: async () => false,
  isTokenExpired: () => true,
});

// Helper function to parse JWT and check expiration
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for token in cookies
        const token = Cookies.get('token');
        if (!token) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Check if token is expired
        if (isTokenExpired()) {
          console.log('[Auth] Token is expired on load, attempting refresh');
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.log('[Auth] Token refresh failed on load');
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
          }
        }

        // Load user from localStorage if token exists
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[Auth] Error loading user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function - saves token to cookies and user to localStorage
  const login = (token: string, userData: AuthUser) => {
    // Save token to cookies (httpOnly for security in production)
    Cookies.set('token', token, { 
      expires: 1, // 1 day
      path: '/',
      sameSite: 'strict'
    });
    
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function - clear all auth data
  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('csrfToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Get token function
  const getToken = () => {
    return Cookies.get('token') || null;
  };

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    const token = getToken();
    if (!token) return true;
    
    const decodedToken = parseJwt(token);
    if (!decodedToken) return true;
    
    // Add 10 seconds buffer to make sure we refresh before actual expiration
    const currentTime = Date.now() / 1000 - 10;
    return decodedToken.exp < currentTime;
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('[Auth] Attempting to refresh token');
      const token = getToken();
      if (!token) {
        console.log('[Auth] No token to refresh');
        return false;
      }
      
      const response = await axios.post('/api/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.token) {
        console.log('[Auth] Token refreshed successfully');
        Cookies.set('token', response.data.token, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict'
        });
        return true;
      }
      
      console.log('[Auth] Token refresh failed - no token in response');
      return false;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        getToken,
        refreshToken,
        isTokenExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 