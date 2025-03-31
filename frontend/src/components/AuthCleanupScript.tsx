'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component provides a last resort error handling for auth issues.
 * It adds a global error handler that will clean up authentication state
 * if there are any unhandled auth errors.
 */
export default function AuthCleanupScript() {
  const router = useRouter();

  useEffect(() => {
    // This function runs only on the client side
    if (typeof window !== 'undefined') {
      // Function to clean up auth tokens
      const cleanupAuth = () => {
        console.log('[AuthCleanup] Executing emergency auth cleanup');
        
        // Clean cookies - use multiple approaches to be thorough
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'js_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Clean localStorage
        localStorage.removeItem('user');
        
        // Clean sessionStorage
        sessionStorage.removeItem('csrfToken');
        
        // Redirect to login
        router.push('/login?expired=true');
      };
      
      // Create a global variable to access cleanup
      window.__authCleanup = cleanupAuth;
      
      // Add global error handler for auth-related errors
      const originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (
          message && 
          (
            (typeof message === 'string' && message.toLowerCase().includes('unauthorized')) ||
            error?.message?.toLowerCase().includes('unauthorized')
          )
        ) {
          console.log('[AuthCleanup] Detected auth error:', message);
          cleanupAuth();
        }
        
        // Call original error handler
        if (originalOnError) {
          return originalOnError.apply(this, arguments as any);
        }
        return false;
      };
      
      // Clean up on unmount
      return () => {
        window.onerror = originalOnError;
      };
    }
  }, [router]);
  
  // This component doesn't render anything
  return null;
}