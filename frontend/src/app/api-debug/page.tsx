'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';

export default function ApiDebugPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoints = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log(`Testing API call to: ${endpoint}`);
      const response = await api.get(endpoint);
      console.log('Response:', response.data);
      setResults(response.data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Unknown error');
      if (err.response) {
        setResults(err.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">API Proxy Debug</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-medium mb-4">Test API Endpoints</h2>
            
            <div className="space-y-2">
              <Button 
                variant="default"
                onClick={() => testEndpoints('/auth/validate')}
                disabled={isLoading}
                className="w-full"
              >
                Test Auth Validation
              </Button>
              
              <Button 
                variant="default"
                onClick={() => testEndpoints('/auth/csrf-token')}
                disabled={isLoading}
                className="w-full"
              >
                Test CSRF Token
              </Button>
              
              <Button 
                variant="default"
                onClick={() => testEndpoints('/orders?page=1&limit=10')}
                disabled={isLoading}
                className="w-full"
              >
                Test Orders
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Response</h3>
            {error && (
              <div className="text-red-500 mb-2">Error: {error}</div>
            )}
            {results ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No results yet. Run a test to see results.</p>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">How This Works</h3>
            <p>
              All API requests are now routed through our server-side proxy at
              <code className="ml-1 bg-gray-100 p-1 rounded">/api/proxy/[...path]</code>
            </p>
            <p className="mt-2">
              This avoids CORS issues by having the server make requests 
              to the backend instead of the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 