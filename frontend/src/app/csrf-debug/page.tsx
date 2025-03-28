'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { CsrfDebug } from '@/components/CsrfDebug';
import { JwtDebug } from '@/components/JwtDebug';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

export default function CsrfDebugPage() {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: 'SUCCESS ✅'
      }));
    } catch (error: any) {
      console.error(`Test failed: ${testName}`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: `FAILED ❌ - ${error.message || 'Unknown error'}`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">CSRF Token Debug Page</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <CsrfDebug />
          
          <div className="mt-6">
            <JwtDebug />
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Test Endpoints</h3>
            
            <div className="space-y-2">
              <Button 
                variant="secondary"
                onClick={() => runTest('Fetch CSRF Token', async () => {
                  const response = await api.get('/auth/csrf-token');
                  return response.data;
                })}
                disabled={isLoading}
              >
                Test: Fetch CSRF Token
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => runTest('GET Orders (Protected)', async () => {
                  const response = await api.get('/orders?page=1&limit=10');
                  return response.data;
                })}
                disabled={isLoading}
              >
                Test: GET Orders
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => runTest('POST Test (With CSRF)', async () => {
                  const response = await api.post('/auth/test-csrf', { test: 'data' });
                  return response.data;
                })}
                disabled={isLoading}
              >
                Test: POST with CSRF
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => runTest('Test CSRF Proxy', async () => {
                  const response = await api.get('/api/csrf-proxy');
                  return response.data;
                })}
                disabled={isLoading}
              >
                Test: CSRF Proxy
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => runTest('Test CSRF Protection', async () => {
                  const response = await api.post('/api/csrf-test', { 
                    test: 'data',
                    timestamp: new Date().toISOString()
                  });
                  return response.data;
                })}
                disabled={isLoading}
              >
                Test: CSRF Protection
              </Button>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">JWT Token Tests</h3>
                
                <Button 
                  variant="secondary"
                  onClick={() => runTest('Debug JWT Token', async () => {
                    const response = await fetch('/api/auth-debug');
                    const data = await response.json();
                    
                    // Show detailed results in alert
                    if (data.success) {
                      setTestResults(prev => ({
                        ...prev,
                        'JWT Expiry': data.payload.expiration.expired ? 
                          `EXPIRED ⚠️ (${data.payload.expiration.date})` : 
                          `Valid ✅ (${data.payload.expiration.timeLeft} left)`,
                        'JWT Payload': `Contains: ${Object.keys(data.payload).join(', ')}`
                      }));
                    }
                    
                    return data;
                  })}
                  disabled={isLoading}
                >
                  Debug JWT Token
                </Button>
                
                <Button 
                  variant="secondary"
                  className="mt-2"
                  onClick={() => runTest('Proxy Orders Request', async () => {
                    const response = await fetch('/api/orders-proxy?page=1&limit=10');
                    return await response.json();
                  })}
                  disabled={isLoading}
                >
                  Test: Orders via Proxy
                </Button>
                
                <Button 
                  variant="secondary"
                  className="mt-2"
                  onClick={() => runTest('Verify JWT Token', async () => {
                    const response = await fetch('/api/verify-token');
                    const data = await response.json();
                    
                    if (data.valid) {
                      setTestResults(prev => ({
                        ...prev,
                        'JWT Validation': 'VALID ✅'
                      }));
                    } else {
                      setTestResults(prev => ({
                        ...prev,
                        'JWT Validation': `INVALID ❌ - ${data.error}`
                      }));
                    }
                    
                    return data;
                  })}
                  disabled={isLoading}
                >
                  Verify JWT Token
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results</h3>
          {Object.keys(testResults).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="text-sm">
                  <span className="font-medium">{test}:</span> {result}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Run tests to see results</p>
          )}
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Current Tokens</h3>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <p>JWT Token: {Cookies.get('token') ? 'Present' : 'Not found'}</p>
              <p>CSRF Token: {sessionStorage.getItem('csrfToken') ? 'Present' : 'Not found'}</p>
              <p>CSRF Cookie: {document.cookie.includes('_csrf') ? 'Present' : 'Not found'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="destructive" onClick={() => {
              sessionStorage.removeItem('csrfToken');
              setTestResults({});
              alert('CSRF token cleared from sessionStorage');
            }}>
              Clear CSRF Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 