'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrdersDetailPatchProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: string) => void;
}

export default function OrdersDetailPatch({ 
  orderId, 
  orderNumber, 
  currentStatus,
  onStatusUpdate 
}: OrdersDetailPatchProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const router = useRouter();

  // Function to generate a cache buster parameter
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Handle status update directly to backend
  const updateStatusDirectBackend = async (newStatus: string) => {
    if (!orderId) {
      console.error('[OrdersDetailPatch] Order ID is missing');
      setDebugInfo('Error: Order ID is missing');
      return;
    }

    setIsUpdating(true);
    setDebugInfo(`Updating status to ${newStatus}...`);

    try {
      // Add cache buster to prevent caching
      const cacheBuster = generateCacheBuster();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${backendUrl}/orders/${orderId}/status?${cacheBuster}`;

      console.log(`[OrdersDetailPatch] Sending PATCH to: ${url}`);
      setDebugInfo(prev => `${prev}\nSending PATCH to: ${url}`);

      // Get JWT token from local storage or session
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || 
                    // Fallback to hardcoded token for testing
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzMyY2Y3NS1mNzYxLTQ4MTUtOTFiNC02MTlkMWNhOGViNWEiLCJ1c2VybmFtZSI6ImZhaG1pIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzQzMzQzNDY0LCJleHAiOjE3NDM0Mjk4NjR9.lpFBwyGZOapYEdAhtHVV6Io5Q4JYHsg3_Lsmn6Qvh6Q';

      // Make direct API call to backend
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ status: newStatus })
      });

      // Get response text for debugging
      const responseText = await response.text();
      console.log(`[OrdersDetailPatch] Response status: ${response.status}`);
      console.log(`[OrdersDetailPatch] Response body: ${responseText}`);
      
      setDebugInfo(prev => `${prev}\nResponse status: ${response.status}\nResponse body: ${responseText}`);

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status} ${responseText}`);
      }

      // Parse the response if it's JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('[OrdersDetailPatch] Parsed response:', responseData);
      } catch (e) {
        console.warn('[OrdersDetailPatch] Not JSON response:', responseText);
      }

      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }

      // Force refresh the page to reflect new status
      router.refresh();
      
      // Also navigate to the same page to force a complete refresh
      setTimeout(() => {
        const currentUrl = window.location.href;
        const urlWithCacheBuster = currentUrl.includes('?') 
          ? `${currentUrl}&refresh=${Date.now()}` 
          : `${currentUrl}?refresh=${Date.now()}`;
        
        window.location.href = urlWithCacheBuster;
      }, 500);

      setDebugInfo(prev => `${prev}\nStatus updated successfully. Refreshing page...`);
    } catch (error: any) {
      console.error('[OrdersDetailPatch] Error updating status:', error);
      setDebugInfo(prev => `${prev}\nError: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Enhanced Status Update</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">Current Status: <strong>{currentStatus}</strong></span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {['new', 'processing', 'washing', 'drying', 'folding', 'ready', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => updateStatusDirectBackend(status)}
            disabled={isUpdating || status === currentStatus}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              status === currentStatus 
                ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
          >
            {status}
          </button>
        ))}
      </div>
      
      {isUpdating && (
        <div className="text-sm text-blue-600 animate-pulse">
          Updating status, please wait...
        </div>
      )}
      
      {showDebug && debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 text-xs font-mono whitespace-pre-wrap rounded-md max-h-32 overflow-y-auto">
          {debugInfo}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-4">
        <p>This component makes direct backend API calls with cache busting to ensure status updates are immediately visible.</p>
        <p>If the page doesn't refresh automatically, click any of the status buttons again.</p>
      </div>
    </div>
  );
} 