import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, email: string, name: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Add a timestamp tracker for the last successful token validation
let lastValidationTime = 0;
const VALIDATION_INTERVAL = 1000 * 60 * 30; // 30 minutes

export default function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log('[useAuth] Checking authentication status');
        
        // Check if token exists in cookies
        const token = Cookies.get('token');
        const currentUser = authService.getCurrentUser();
        
        // Handle case where user exists in localStorage but token is missing in cookies
        if (currentUser && !token) {
          console.log('[useAuth] Found user in localStorage, but no token in cookies - inconsistent state');
          // Clear user without API calls since token is already missing
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (currentUser && token) {
          console.log('[useAuth] Found user in local storage:', currentUser.username);
          
          // Only validate token if we haven't done so recently
          const now = Date.now();
          const shouldValidate = now - lastValidationTime > VALIDATION_INTERVAL;
          
          if (shouldValidate) {
            console.log('[useAuth] Token validation needed');
            // Validate token with backend
            const isValid = await authService.validateToken();
            if (isValid) {
              console.log('[useAuth] Token validated successfully');
              lastValidationTime = now; // Update last validation time
              setUser(currentUser);
            } else {
              console.log('[useAuth] Token validation failed, logging out');
              // If token is invalid, log out
              await authService.forceLogout();
              setUser(null);
            }
          } else {
            console.log('[useAuth] Using cached token validation');
            setUser(currentUser);
          }
        } else {
          console.log('[useAuth] No user in local storage or no token');
          setUser(null);
        }
      } catch (err) {
        console.error('[useAuth] Authentication check failed:', err);
        setError('Authentication check failed');
        // Clean up on error
        await authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Don't automatically logout here as it's causing a loop
      // Just make the login request directly
      const response = await authService.login({ username, password });
      
      if (response && response.token) {
        const user = authService.getCurrentUser();
        lastValidationTime = Date.now(); // Set validation time on successful login
        setUser(user);
        return true;
      } else {
        setError('Login failed');
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    lastValidationTime = 0; // Reset validation time on logout
    router.push('/login');
  }, [router]);

  // Register function
  const register = async (username: string, password: string, email: string, name: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useAuth] Registering user:', username);
      const result = await authService.register(username, password, email, name);
      
      console.log('[useAuth] Registration result:', {
        success: !!result,
        hasUser: !!result?.user,
        hasToken: !!result?.token
      });
      
      // We intentionally don't set the user here as we want them to log in explicitly
      return true;
    } catch (err: any) {
      console.error('[useAuth] Registration error:', err);
      setError(err?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
} 