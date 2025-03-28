'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import api from '@/utils/api';

// Create the context
interface CsrfContextType {
  csrfToken: string | null;
  refreshCsrfToken: () => Promise<string | null>;
  isRefreshing: boolean;
  lastError: string | null;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

// Provider component
export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Function to refresh the CSRF token
  const refreshCsrfToken = async (): Promise<string | null> => {
    // Get token from multiple sources for resilience
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const backupToken = localStorage.getItem('token_backup');
    const token = cookieToken || backupToken;
    
    if (!token) {
      setLastError('No JWT token available');
      return null;
    }
    
    setIsRefreshing(true);
    setLastError(null);
    
    try {
      console.log('CsrfProvider: Refreshing CSRF token');
      
      // Always use the proxy endpoint to avoid CORS issues
      const csrfPath = '/api/csrf-proxy';
      
      console.log(`CsrfProvider: Using proxy path ${csrfPath}`);
      
      // Using the proxy path that runs on the same origin
      const response = await api.get(csrfPath, { 
        withCredentials: true,
        headers: {
          // Send the token we found
          'Authorization': `Bearer ${token}`
        }
      });
      
      const csrfToken = response.data.csrfToken;
      
      if (csrfToken) {
        console.log('CsrfProvider: Token refreshed successfully');
        sessionStorage.setItem('csrfToken', csrfToken);
        setCsrfToken(csrfToken);
        return csrfToken;
      }
      
      const errorMsg = 'No CSRF token in response';
      console.error('CsrfProvider:', errorMsg, response.data);
      setLastError(errorMsg);
      return null;
    } catch (error: any) {
      const errorMsg = `Failed to refresh CSRF token: ${error.message || 'Unknown error'}`;
      console.error('CsrfProvider:', errorMsg);
      setLastError(errorMsg);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize CSRF token when the user is authenticated
  useEffect(() => {
    const checkAndInitToken = async () => {
      // Check for token directly from cookies
      const jwtToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      // Also check localStorage backup token if needed
      const backupToken = localStorage.getItem('token_backup');
      
      // If we have a token in cookies or backup, we should try to get a CSRF token
      // This provides resilience against auth state mismatches
      if (jwtToken || (backupToken && isAuthenticated === false)) {
        console.log('CsrfProvider: Token found, checking for CSRF token');
        
        // Check if we already have a token in sessionStorage
        const storedToken = sessionStorage.getItem('csrfToken');
        if (storedToken) {
          console.log('CsrfProvider: Using stored CSRF token');
          setCsrfToken(storedToken);
        } else {
          // If not, fetch a new token
          console.log('CsrfProvider: No stored token, fetching new one');
          refreshCsrfToken();
        }
      } else if (!jwtToken && !backupToken) {
        // Clear CSRF token when user is definitely not authenticated
        console.log('CsrfProvider: No JWT token found, clearing CSRF token');
        setCsrfToken(null);
        sessionStorage.removeItem('csrfToken');
      }
    };
    
    checkAndInitToken();
  }, [isAuthenticated]);

  return (
    <CsrfContext.Provider value={{ 
      csrfToken, 
      refreshCsrfToken, 
      isRefreshing,
      lastError 
    }}>
      {children}
    </CsrfContext.Provider>
  );
}

// Hook to use the CSRF context
export function useCsrf() {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
} 