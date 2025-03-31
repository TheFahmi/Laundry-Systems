'use client';

import { useState, useEffect } from 'react';

export default function DirectTestPage() {
  const [output, setOutput] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [debugMode, setDebugMode] = useState(true);
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzMyY2Y3NS1mNzYxLTQ4MTUtOTFiNC02MTlkMWNhOGViNWEiLCJ1c2VybmFtZSI6ImZhaG1pIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzQzMzQzNDY0LCJleHAiOjE3NDM0Mjk4NjR9.lpFBwyGZOapYEdAhtHVV6Io5Q4JYHsg3_Lsmn6Qvh6Q');
  const [backendBaseUrl, setBackendBaseUrl] = useState('http://localhost:3001');
  const [orderId] = useState('b65a7121-6d18-4c00-8fab-0c450110022f');
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Generate a cache buster
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Log to both console and state
  const log = (message: string, obj?: any) => {
    if (obj) {
      console.log(message, obj);
      setOutput(prev => `${prev}\n${message} ${JSON.stringify(obj, null, 2)}`);
    } else {
      console.log(message);
      setOutput(prev => `${prev}\n${message}`);
    }
  };

  // Function to extract status from response
  const extractStatus = (text: string): string => {
    try {
      const data = JSON.parse(text);
      return data?.data?.status || 'unknown';
    } catch (e) {
      return 'parsing error';
    }
  };
  
  // Test order endpoint
  async function testOrderGet() {
    try {
      setOutput('Fetching order details...');
      
      // Add cache buster
      const cacheBuster = generateCacheBuster();
      const url = `${backendBaseUrl}/orders/${orderId}?${cacheBuster}`;
      
      if (debugMode) log(`Sending GET request to: ${url}`);
      if (debugMode) log(`Authorization token (first 10 chars): ${token.substring(0, 10)}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (debugMode) log(`Response status: ${response.status}`);
      if (debugMode) log(`Response headers:`, Object.fromEntries([...response.headers]));
      
      const text = await response.text();
      const status = extractStatus(text);
      setCurrentStatus(status);
      
      try {
        const data = JSON.parse(text);
        if (debugMode) log(`Order data parsed successfully. ID: ${data?.data?.id}, Status: ${data?.data?.status}`);
        setOutput(`Status: ${response.status}\nCurrent order status: ${status}\n\n${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        log(`Error parsing response: ${e}`);
        setOutput(`Status: ${response.status}\nCurrent order status: ${status}\n\n${text}`);
      }
    } catch (error: any) {
      log(`Error fetching order: ${error.message}`);
      setOutput(`Error: ${error.message}`);
    }
  }
  
  // Toggle polling
  function togglePolling() {
    if (isPolling) {
      // Stop polling
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      setIsPolling(false);
      setOutput(prev => prev + '\n\nPolling stopped.');
    } else {
      // Start polling - check every 2 seconds
      testOrderGet(); // Immediate check
      const interval = setInterval(testOrderGet, 2000);
      setPollInterval(interval);
      setIsPolling(true);
      setOutput('Started polling for order status every 2 seconds...');
    }
  }
  
  // Test status update with various statuses
  async function testStatusUpdate(newStatus: string) {
    try {
      setOutput(`Updating status to "${newStatus}"...`);
      
      const requestBody = { status: newStatus };
      
      // Add cache buster
      const cacheBuster = generateCacheBuster();
      const url = `${backendBaseUrl}/orders/${orderId}/status?${cacheBuster}`;
      
      if (debugMode) log(`Sending PATCH request to: ${url}`);
      if (debugMode) log(`Authorization token (first 10 chars): ${token.substring(0, 10)}...`);
      if (debugMode) log(`Request body:`, requestBody);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (debugMode) log(`Response status: ${response.status}`);
      if (debugMode) log(`Response headers:`, Object.fromEntries([...response.headers]));
      
      const text = await response.text();
      if (debugMode) log(`Raw response:`, text);
      
      try {
        const data = JSON.parse(text);
        if (debugMode) log(`Response parsed successfully:`, data);
        setOutput(`Status update response: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        log(`Error parsing response: ${e}`);
        setOutput(`Status update response: ${response.status}\n\n${text}`);
      }
      
      // If successful, get the current order to verify the change
      if (response.ok) {
        log(`Status update successful, checking current status in 1 second...`);
        setTimeout(testOrderGet, 1000); // Check after 1 second
      } else {
        log(`Status update failed with status code ${response.status}`);
      }
    } catch (error: any) {
      log(`Error updating status: ${error.message}`);
      setOutput(`Error: ${error.message}`);
    }
  }

  // Direct database update through our API route
  async function updateDirect() {
    try {
      setOutput(`Attempting to update via API route...`);
      
      const cacheBuster = generateCacheBuster();
      const response = await fetch(`/api/orders/force-update-status?${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          id: orderId,
          status: 'processing'
        })
      });
      
      const text = await response.text();
      setOutput(`Direct update response: ${response.status}\n\n${text}`);
      
      // If successful, get the current order to verify the change
      if (response.ok) {
        setTimeout(testOrderGet, 1000); // Check after 1 second
      }
    } catch (error: any) {
      setOutput(`Error with direct update: ${error.message}`);
    }
  }

  // Direct PATCH to backend with debugged request
  async function directBackendPatch() {
    try {
      setOutput(`Sending direct PATCH request to backend...`);
      const newStatus = 'processing';
      
      // Add cache buster
      const cacheBuster = generateCacheBuster();
      const url = `${backendBaseUrl}/orders/${orderId}/status?${cacheBuster}`;
      
      if (debugMode) {
        log(`Request URL: ${url}`);
        log(`Request headers: Authorization: Bearer ${token.substring(0, 10)}... and Content-Type: application/json`);
        log(`Request body: {"status":"${newStatus}"}`);
      }
      
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
      
      const text = await response.text();
      
      if (debugMode) {
        log(`Response status: ${response.status} ${response.statusText}`);
        log(`Response headers:`, Object.fromEntries([...response.headers]));
        log(`Raw response: ${text}`);
      }
      
      try {
        const data = JSON.parse(text);
        setOutput(`Backend PATCH response: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        setOutput(`Backend PATCH response: ${response.status}\n\nNon-JSON response: ${text}`);
      }
      
      // If successful, get the current order to verify the change
      if (response.ok) {
        setTimeout(testOrderGet, 1000); // Check after 1 second
      }
    } catch (error: any) {
      log(`Error with direct backend PATCH: ${error.message}`);
      setOutput(`Error: ${error.message}`);
    }
  }

  // Hard refresh from server
  function hardRefresh() {
    setOutput('Performing hard refresh from server...');
    
    // Clear browser cache for this page
    window.location.href = window.location.href + '?refresh=' + Date.now();
  }
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Direct API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Status: <span style={{ color: '#FF5722' }}>{currentStatus || 'Unknown'}</span></h3>
        <p>Testing order ID: <code>{orderId}</code></p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Configuration:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor="backendUrl" style={{ display: 'block', marginBottom: '5px' }}>Backend URL:</label>
            <input 
              type="text" 
              id="backendUrl" 
              value={backendBaseUrl} 
              onChange={(e) => setBackendBaseUrl(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label htmlFor="authToken" style={{ display: 'block', marginBottom: '5px' }}>Auth Token:</label>
            <input 
              type="text" 
              id="authToken" 
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="debugMode" 
              checked={debugMode} 
              onChange={() => setDebugMode(!debugMode)}
            />
            <label htmlFor="debugMode">Debug Mode (Show Detailed Logs)</label>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testOrderGet}
          style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Refresh Order
        </button>
        
        <button 
          onClick={togglePolling}
          style={{ 
            padding: '10px', 
            background: isPolling ? '#F44336' : '#9C27B0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          {isPolling ? 'Stop Polling' : 'Start Auto-Refresh'}
        </button>
        
        <button 
          onClick={updateDirect}
          style={{ 
            padding: '10px', 
            background: '#FF9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Update via API Route
        </button>

        <button 
          onClick={directBackendPatch}
          style={{ 
            padding: '10px', 
            background: '#E91E63', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Direct PATCH to Backend
        </button>

        <button 
          onClick={hardRefresh}
          style={{ 
            padding: '10px', 
            background: '#607D8B', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Hard Refresh Page
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Update Status:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['new', 'processing', 'washing', 'drying', 'folding', 'ready', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => testStatusUpdate(status)}
              style={{ 
                padding: '10px', 
                background: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      <h3>Output:</h3>
      <div style={{ 
        marginTop: '10px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        background: '#f9f9f9',
        whiteSpace: 'pre-wrap',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {output || 'Click a button to test API'}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '4px' }}>
        <h3>Troubleshooting Tips:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>If you click "Refresh Order" and see status code 200, the order exists in the database.</li>
          <li>If status update doesn't change the status, check if the response indicates an error.</li>
          <li>Try different status values to see if any specific one works.</li>
          <li>Enable Debug Mode for detailed request/response information.</li>
          <li>Use "Direct PATCH to Backend" to bypass Next.js route handling and send a request directly to the backend.</li>
          <li>Check the Auth Token if you're getting 401 Unauthorized responses.</li>
          <li>All requests now include cache-busting parameters to prevent cached responses.</li>
        </ol>
      </div>
    </div>
  );
} 