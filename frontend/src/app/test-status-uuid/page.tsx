'use client';

import { useEffect, useState } from 'react';

export default function UuidTestStatusPage() {
  const [orderId, setOrderId] = useState('b65a7121-6d18-4c00-8fab-0c450110022f');
  const [status, setStatus] = useState('processing');
  const [result, setResult] = useState('Siap mengirim permintaan update status...');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');

  // When component mounts, try to get API URL from env
  useEffect(() => {
    // Get the API URL from any available source
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    setApiUrl(apiUrl);
    
    // Try to get the token from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    
    const token = getCookie('token') || getCookie('js_token');
    if (token) {
      // Show only first 10 chars for security
      setToken(token.substring(0, 10) + '...');
    } else {
      setToken('Tidak ditemukan');
    }
  }, []);

  async function updateStatus() {
    setLoading(true);
    setResult('Mengirim permintaan...');
    
    try {
      console.log(`Mengirim permintaan update status untuk UUID: ${orderId}`);
      console.log(`Status baru: ${status}`);
      
      // Using the direct UUID endpoint
      const response = await fetch('/api/orders/direct-uuid-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uuid: orderId,
          status: status
        })
      });
      
      console.log(`Status response: ${response.status}`);
      
      const responseText = await response.text();
      let resultText = `Response status: ${response.status}\n\n`;
      
      try {
        const data = JSON.parse(responseText);
        resultText += JSON.stringify(data, null, 2);
      } catch (e) {
        resultText += responseText;
      }
      
      setResult(resultText);
      
      // If successful, check the order again to verify the update took effect
      if (response.ok) {
        setTimeout(() => {
          fetchOrderDetails();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function sendDirectBackendRequest() {
    setLoading(true);
    setResult('Mengirim permintaan langsung ke backend...');
    
    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
        return '';
      };
      
      const token = getCookie('token') || getCookie('js_token');
      if (!token) {
        setResult('Token tidak ditemukan. Mohon login kembali.');
        setLoading(false);
        return;
      }
      
      // Send request directly to backend
      const updateUrl = `${apiUrl}/orders/${orderId}/status`;
      console.log(`Mengirim permintaan langsung ke: ${updateUrl}`);
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      console.log(`Status response: ${response.status}`);
      
      const responseText = await response.text();
      let resultText = `Response status: ${response.status}\n\n`;
      
      try {
        const data = JSON.parse(responseText);
        resultText += JSON.stringify(data, null, 2);
      } catch (e) {
        resultText += responseText;
      }
      
      setResult(resultText);
      
      // If successful, check the order again to verify the update took effect
      if (response.ok) {
        setTimeout(() => {
          fetchOrderDetails();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderDetails() {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/detail/${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      } else {
        setResult(`Failed to fetch order details: ${response.status}`);
      }
    } catch (error: any) {
      setResult(`Error fetching order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Test Update Status Order (UUID Langsung)</h1>
      
      <div style={{ backgroundColor: '#e9f5fe', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Informasi Debug:</h3>
        <p style={{ margin: '0 0 5px 0' }}><strong>Backend API URL:</strong> {apiUrl}</p>
        <p style={{ margin: '0 0 5px 0' }}><strong>Auth Token:</strong> {token}</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Status Baru:
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
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={updateStatus}
          disabled={loading}
          style={{ 
            flex: '1',
            padding: '10px', 
            backgroundColor: loading ? '#cccccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'default' : 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px',
            minWidth: '130px'
          }}
        >
          {loading ? 'Sedang Proses...' : 'Update Status (API)'}
        </button>
        
        <button 
          onClick={sendDirectBackendRequest}
          disabled={loading}
          style={{ 
            flex: '1',
            padding: '10px', 
            backgroundColor: loading ? '#cccccc' : '#ff9800', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'default' : 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px',
            minWidth: '130px'
          }}
        >
          {loading ? 'Sedang Proses...' : 'Update Langsung ke Backend'}
        </button>
        
        <button 
          onClick={fetchOrderDetails}
          disabled={loading}
          style={{ 
            flex: '1',
            padding: '10px', 
            backgroundColor: loading ? '#cccccc' : '#2196F3', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'default' : 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px',
            minWidth: '130px'
          }}
        >
          Cek Order
        </button>
      </div>
      
      <h2>Hasil:</h2>
      <div 
        style={{ 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          backgroundColor: '#f9f9f9', 
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '20px'
        }}
      >
        {result}
      </div>
      
      <h2>Instruksi:</h2>
      <ol style={{ lineHeight: '1.6' }}>
        <li>Pastikan order ID di atas adalah UUID yang benar (bukan order number).</li>
        <li>Pilih status baru yang diinginkan dari dropdown.</li>
        <li>Klik tombol "Update Status (API)" untuk mengirim permintaan melalui API frontend.</li>
        <li>Jika gagal, coba "Update Langsung ke Backend" untuk mengirim langsung ke backend.</li>
        <li>Klik tombol "Cek Order" untuk melihat detail order terbaru.</li>
      </ol>
      
      <p style={{ marginTop: '20px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
        <strong>Catatan:</strong> Halaman ini mencoba dua pendekatan - melalui API frontend atau langsung ke backend.
        Jika kedua pendekatan gagal, kemungkinan ada masalah dengan autentikasi atau format data.
      </p>
    </div>
  );
} 