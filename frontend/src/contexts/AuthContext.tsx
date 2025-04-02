"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

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
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  getToken: () => null,
});

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

        // Load user from localStorage if token exists
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 