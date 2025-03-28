'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Button } from './ui/button';

interface JwtPayload {
  userId?: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export function JwtDebug() {
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const decodeToken = () => {
    setError(null);
    
    try {
      const jwtToken = Cookies.get('token');
      setToken(jwtToken || null);
      
      if (!jwtToken) {
        setError('No JWT token found in cookies');
        return;
      }
      
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(jwtToken);
      setDecodedToken(decoded);
      
      // Check if token is expired
      if (decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const expired = decoded.exp < now;
        setIsExpired(expired);
        
        if (!expired) {
          const minutes = Math.floor((decoded.exp - now) / 60);
          const seconds = (decoded.exp - now) % 60;
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
        }
      }
    } catch (err: any) {
      console.error('Failed to decode JWT token:', err);
      setError(err.message || 'Failed to decode token');
    }
  };

  const resetTokenCookie = async () => {
    try {
      // Get token from localStorage backup
      const backupToken = localStorage.getItem('token_backup');
      
      if (!backupToken) {
        setError('No backup token found in localStorage');
        return;
      }
      
      // Call the API to reset the cookie
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: backupToken })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Also set in js-cookie for immediate access
        Cookies.set('token', backupToken, { 
          expires: 1,
          path: '/',
          sameSite: 'strict'
        });
        
        // Refresh the token display
        decodeToken();
        setError('Token cookie reset successfully');
      } else {
        setError(`Failed to reset token: ${data.message}`);
      }
    } catch (err: any) {
      setError(`Error resetting token: ${err.message}`);
    }
  };

  // Decode token on mount and token change
  useEffect(() => {
    decodeToken();
    
    // Refresh time left every 5 seconds
    const interval = setInterval(() => {
      if (decodedToken?.exp) {
        const now = Math.floor(Date.now() / 1000);
        const expired = decodedToken.exp < now;
        setIsExpired(expired);
        
        if (!expired) {
          const minutes = Math.floor((decodedToken.exp - now) / 60);
          const seconds = (decodedToken.exp - now) % 60;
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          clearInterval(interval);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-2">JWT Token Debug</h3>
      
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      
      {token ? (
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium block mb-1">Token Preview:</span>
            <code className="text-xs bg-gray-100 p-1 rounded block overflow-hidden text-ellipsis">
              {token.substring(0, 20)}...{token.substring(token.length - 20)}
            </code>
          </div>
          
          {decodedToken && (
            <>
              <div>
                <span className="text-xs font-medium block mb-1">Status:</span>
                <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-green-500'}`}>
                  {isExpired ? '❌ Expired' : '✅ Valid'} 
                  {!isExpired && ` (${timeLeft} remaining)`}
                </span>
              </div>
              
              <div>
                <span className="text-xs font-medium block mb-1">User Info:</span>
                <div className="text-xs">
                  <div>UserId: {decodedToken.userId || 'N/A'}</div>
                  <div>Username: {decodedToken.username || 'N/A'}</div>
                  <div>Role: {decodedToken.role || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium block mb-1">Timing:</span>
                <div className="text-xs">
                  <div>Issued At: {decodedToken.iat ? new Date(decodedToken.iat * 1000).toLocaleString() : 'N/A'}</div>
                  <div>Expires At: {decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </>
          )}
          
          <div className="pt-2 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decodeToken}
            >
              Refresh Token Info
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetTokenCookie}
            >
              Repair Token Cookie
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 mt-2">
          No JWT token found. Please login first.
        </div>
      )}
    </div>
  );
} 