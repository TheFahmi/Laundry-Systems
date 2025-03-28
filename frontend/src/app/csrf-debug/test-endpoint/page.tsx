'use client';

import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { CsrfDebug } from '@/components/CsrfDebug';

export default function CsrfEndpointTestPage() {
  const [endpoint, setEndpoint] = useState('/auth/csrf-token');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const token = Cookies.get('token');
      console.log(`Testing endpoint: ${baseUrl}${endpoint}`);
      console.log(`Token available: ${!!token}`);
      
      const res = await axios.get(`${baseUrl}${endpoint}`, {
        withCredentials: true,
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : undefined
      });
      
      console.log('Response:', res);
      setResult(res.data);
      if (res.data && res.data.csrfToken) {
        sessionStorage.setItem('csrfToken', res.data.csrfToken);
        sessionStorage.setItem('csrfTokenPath', endpoint);
      }
    } catch (err: any) {
      console.error('Error testing endpoint:', err);
      setError(err.message || 'Unknown error');
      if (err.response) {
        setResult({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">CSRF Endpoint Test</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <CsrfDebug />
          
          <div className="bg-white p-4 rounded shadow mt-6">
            <h2 className="font-semibold mb-4">Test CSRF Endpoint</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base URL</label>
                <Input 
                  value={baseUrl} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Endpoint Path</label>
                <Input 
                  value={endpoint} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEndpoint(e.target.value)}
                  placeholder="/auth/csrf-token"
                />
              </div>
              
              <Button
                onClick={testEndpoint}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Endpoint'}
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Test Result</h3>
            {error && (
              <div className="text-red-500 text-sm mb-2">
                Error: {error}
              </div>
            )}
            {result ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 text-sm">No result yet. Run a test to see results.</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Common Endpoints to Try</h3>
            <ul className="text-sm space-y-1">
              <li><code className="bg-gray-100 p-0.5 rounded">/auth/csrf-token</code> - Standard endpoint</li>
              <li><code className="bg-gray-100 p-0.5 rounded">/api/auth/csrf-token</code> - With API prefix</li>
              <li><code className="bg-gray-100 p-0.5 rounded">/v1/auth/csrf-token</code> - With version prefix</li>
              <li><code className="bg-gray-100 p-0.5 rounded">/csrf-token</code> - Root endpoint</li>
              <li><code className="bg-gray-100 p-0.5 rounded">/api/csrf</code> - Alternative endpoint</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 