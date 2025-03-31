'use client';

import { useEffect, useState } from 'react';

export default function TestStatusPage() {
  const [orderId, setOrderId] = useState('b65a7121-6d18-4c00-8fab-0c450110022f');
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState('processing');
  const [result, setResult] = useState('Results will appear here...');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('direct');

  async function updateStatus() {
    setLoading(true);
    setResult('Sending request...');
    
    try {
      let response;
      
      if (method === 'direct') {
        response = await fetch('/api/orders/direct-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: orderId,
            status: status
          })
        });
      } else if (method === 'by-number') {
        if (!orderNumber) {
          setResult('Order number is required for this method');
          setLoading(false);
          return;
        }
        
        response = await fetch(`/api/orders/${orderNumber}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: status
          })
        });
      } else {
        const token = getCookie('token');
        if (!token) {
          setResult('Token not found. Make sure you are logged in.');
          setLoading(false);
          return;
        }
        
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        response = await fetch(`${backendUrl}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: status
          })
        });
      }
      
      const responseText = await response.text();
      let resultText = `Status: ${response.status}\n\n`;
      
      try {
        const data = JSON.parse(responseText);
        resultText += JSON.stringify(data, null, 2);
      } catch (e) {
        resultText += responseText;
      }
      
      resultText += '\n\n--- Debug Info ---\n';
      resultText += `Method: ${method}\n`;
      resultText += `Order ID: ${orderId}\n`;
      resultText += `Order Number: ${orderNumber}\n`;
      resultText += `Status: ${status}\n`;
      resultText += `API Base URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}\n`;
      
      setResult(resultText);
    } catch (error: any) {
      setResult(`Error: ${error.message}\n\nStack: ${error.stack || 'No stack trace available'}`);
    } finally {
      setLoading(false);
    }
  }

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  }

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/orders/by-id/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.orderNumber) {
            setOrderNumber(data.data.orderNumber);
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    }
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Test Order Status Update</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Update Method:
        </label>
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        >
          <option value="direct">Direct (UUID)</option>
          <option value="by-number">By Order Number</option>
          <option value="backend">Direct to Backend</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Order ID (UUID):
        </label>
        <input 
          type="text" 
          value={orderId} 
          onChange={(e) => setOrderId(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Order Number:
        </label>
        <input 
          type="text" 
          value={orderNumber} 
          onChange={(e) => setOrderNumber(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Status:
        </label>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        >
          <option value="new">New</option>
          <option value="processing">Processing</option>
          <option value="washing">Washing</option>
          <option value="drying">Drying</option>
          <option value="folding">Folding</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={updateStatus}
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '8px', 
            backgroundColor: loading ? '#cccccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'default' : 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </div>
      
      <div 
        style={{ 
          marginTop: '20px', 
          padding: '10px', 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          backgroundColor: '#f9f9f9', 
          whiteSpace: 'pre-wrap' 
        }}
      >
        {result}
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
        <h3>Debugging Tools</h3>
        <button 
          onClick={async () => {
            const token = getCookie('token');
            setResult(`Current auth token: ${token ? token.substring(0, 20) + '...' : 'Not found'}`);
          }}
          style={{ 
            padding: '8px', 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Auth Token
        </button>
        
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`/api/orders/${orderNumber}`);
              const data = await response.json();
              setResult(JSON.stringify(data, null, 2));
            } catch (error: any) {
              setResult(`Error fetching order: ${error.message}`);
            }
          }}
          style={{ 
            padding: '8px', 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer'
          }}
        >
          Fetch Order Details
        </button>
      </div>
    </div>
  );
} 