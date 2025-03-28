'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginResponse } from '../api/auth';
import { authService } from '../services/authService';
import Cookies from 'js-cookie';

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (username: string, password: string, email: string, name: string) => Promise<any>;
  logout: () => void;
  getToken: () => string | null;
}

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if we have a token in cookies
        const token = Cookies.get('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Get current user from localStorage or validate token
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token exists but user data not found, try to validate token
          const isValid = await authService.validateToken();
          if (!isValid) {
            // Invalid token, logout
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Error occurred, logout as precaution
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up interceptors for API requests
    authService.setupAxiosInterceptors();
    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<LoginResponse> => {
    try {
      // Use the auth service login function
      const response = await authService.login({ username, password });
      
      // Store the JWT token in cookies with proper attributes
      if (response.token) {
        Cookies.set('token', response.token, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict',
          secure: window.location.protocol === 'https:'
        });
        
        // Also set token in localStorage as a backup
        localStorage.setItem('token_backup', response.token);
      }
      
      // Update state with user data
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
      
      return response;
    } catch (error) {
      // Error handling is already done in the auth service
      // Just propagate the error so it can be handled by the UI
      console.error('Login error in AuthProvider:', error);
      throw error;
    }
  }, [router]);

  // Register function
  const register = useCallback(async (username: string, password: string, email: string, name: string) => {
    try {
      console.log('AuthProvider register called with:', { username, password: '***', email, name });
      
      const response = await authService.register(username, password, email, name);
      console.log('Registration successful in AuthProvider');
      
      // Redirect to login after successful registration
      router.push('/login');
      
      return response;
    } catch (error) {
      console.error('Registration error in AuthProvider:', error);
      throw error;
    }
  }, [router]);

  // Logout function
  const logout = useCallback(() => {
    // Remove token from cookies
    Cookies.remove('token');
    
    // Call the auth service logout
    authService.logout();
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    router.push('/login');
  }, [router]);

  // Get token function
  const getToken = useCallback(() => {
    return Cookies.get('token') || null;
  }, []);

  // Create the context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 