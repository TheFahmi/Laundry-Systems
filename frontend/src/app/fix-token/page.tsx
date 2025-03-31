'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { APP_NAME } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FixTokenPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleFixToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Please enter your username');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Clear any existing tokens first
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('user');
      
      // Call the fix token API
      await authService.fixToken(username);
      
      setSuccess(`Token fixed successfully for ${username}. You're now logged in.`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Fix token error:', err);
      setError(err.message || 'Failed to fix token. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCleanup = () => {
    // Clean up all cookies and local storage
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    setSuccess('All auth data cleared successfully. You can now try to log in again.');
  };
  
  return (
    <div className="container max-w-screen-lg mx-auto px-4">
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Fix Token Issues - {APP_NAME}</CardTitle>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleFixToken}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Fixing Token...' : 'Fix Token Issues'}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    <p>This will generate a new token for your account</p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                      onClick={handleCleanup}
                    >
                      Clean All Auth Data
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 