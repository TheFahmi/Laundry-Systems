"use client";

import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import useAuthHook, { User, UseAuthReturn } from '@/hooks/useAuth';
import { validateToken } from '@/services/authService';

// Create a context with default values
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthHook();

  // Provide a global cleanup function for unhandled auth errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a global auth error handler
      window.addEventListener('auth:error', () => {
        auth.logout();
      });
      
      // Track network status to validate auth on reconnect
      const handleOnline = async () => {
        if (auth.user && !auth.loading) {
          const isValid = await validateToken();
          
          if (!isValid) {
            auth.logout();
          }
        }
      };
      
      window.addEventListener('online', handleOnline);
      
      return () => {
        window.removeEventListener('auth:error', auth.logout);
        window.removeEventListener('online', handleOnline);
      };
    }
  }, [auth]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Alias export for backwards compatibility
export const useAuth = useAuthContext; 