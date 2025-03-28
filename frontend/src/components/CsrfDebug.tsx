'use client';

import React from 'react';
import { useCsrf } from '@/providers/CsrfProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from './ui/button';

export function CsrfDebug() {
  const { csrfToken, refreshCsrfToken, isRefreshing, lastError } = useCsrf();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <p className="text-sm text-red-500">Please login to see CSRF token info</p>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-2">CSRF Token Debug</h3>
      
      <div className="text-sm mb-2 space-y-1">
        <p>Status: {isRefreshing ? '🔄 Refreshing...' : csrfToken ? '✅ Available' : '❌ Not available'}</p>
        
        {lastError && (
          <p className="text-red-500">Error: {lastError}</p>
        )}
        
        {csrfToken && (
          <div>
            <p className="font-medium">Token:</p>
            <p className="text-xs overflow-auto font-mono bg-white p-1 rounded">
              {csrfToken.length > 60 
                ? `${csrfToken.substring(0, 30)}...${csrfToken.substring(csrfToken.length - 30)}`
                : csrfToken}
            </p>
          </div>
        )}
        
        <div>
          <p className="font-medium mt-2">User:</p>
          <p className="text-xs">{user?.username} ({user?.role})</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button 
          size="sm" 
          variant="default" 
          onClick={async () => {
            const newToken = await refreshCsrfToken();
            if (newToken) {
              alert('CSRF Token refreshed successfully!');
            } else {
              alert('Failed to refresh CSRF token. Check console for errors.');
            }
          }}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh CSRF Token'}
        </Button>
        
        <Button 
          size="sm"
          variant="destructive"
          onClick={() => {
            sessionStorage.removeItem('csrfToken');
            window.location.reload();
          }}
        >
          Clear Token
        </Button>
      </div>
    </div>
  );
} 