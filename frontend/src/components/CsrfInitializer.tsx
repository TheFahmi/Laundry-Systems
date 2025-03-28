'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface CsrfInitializerProps {
  children?: React.ReactNode;
}

export default function CsrfInitializer({ children }: CsrfInitializerProps) {
  const { isAuthenticated } = useAuth();

  // Initialize CSRF token
  const initializeCsrfToken = async () => {
    try {
      console.log('[CsrfInitializer] Checking for CSRF token');
      // Check if token already exists in sessionStorage
      const existingToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
      
      if (existingToken) {
        console.log('[CsrfInitializer] CSRF token already exists');
        return;
      }
      
      // Only try to fetch a token if the user is authenticated
      if (!isAuthenticated) {
        console.log('[CsrfInitializer] User not authenticated, skipping CSRF token fetch');
        return;
      }
      
      console.log('[CsrfInitializer] Fetching new CSRF token');
      
      // Try to get a new CSRF token
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.csrfToken || (data.data && data.data.csrfToken))) {
        const token = data.csrfToken || data.data.csrfToken;
        console.log('[CsrfInitializer] Got new CSRF token, storing in session storage');
        sessionStorage.setItem('csrfToken', token);
      } else {
        console.warn('[CsrfInitializer] Response did not contain CSRF token:', data);
      }
    } catch (err) {
      console.error('[CsrfInitializer] Error fetching CSRF token:', err);
    }
  };

  useEffect(() => {
    initializeCsrfToken();
  }, [isAuthenticated]);

  return children || null;
} 