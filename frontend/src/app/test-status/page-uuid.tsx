'use client';

import { useEffect, useState } from 'react';

export default function UuidTestStatusPage() {
  const [orderId, setOrderId] = useState('b65a7121-6d18-4c00-8fab-0c450110022f');
  const [status, setStatus] = useState('processing');
  const [result, setResult] = useState('Siap mengirim permintaan update status...');
  const [loading, setLoading] = useState(false);
  const [backendLogs, setBackendLogs] = useState<string[]>([]);

  async function updateStatus() {
    setLoading(true);
    setResult('Mengirim permintaan...');
    setBackendLogs([]);
    
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

  async function fetchBackendLogs() {
    try {
      setLoading(true);
      const response = await fetch(`/api/debug/logs?lines=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.logs && Array.isArray(data.logs)) {
          setBackendLogs(data.logs);
        }
      } else {
        setBackendLogs(['Failed to fetch logs']);
      }
    } catch (error: any) {
      setBackendLogs([`Error fetching logs: ${error.message}`]);
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
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
            borderRadius: '4px'
          }}
        >
          {loading ? 'Sedang Proses...' : 'Update Status'}
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
            borderRadius: '4px'
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
        <li>Klik tombol "Update Status" untuk mengirim permintaan update.</li>
        <li>Klik tombol "Cek Order" untuk melihat detail order terbaru.</li>
        <li>Jika status tidak berubah, cek log di konsol browser dan log backend.</li>
      </ol>
      
      <p style={{ marginTop: '20px', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
        <strong>Catatan:</strong> Halaman ini menggunakan endpoint API yang langsung mengirim UUID ke backend
        tanpa perlu mencari order number terlebih dahulu.
      </p>
    </div>
  );
} 