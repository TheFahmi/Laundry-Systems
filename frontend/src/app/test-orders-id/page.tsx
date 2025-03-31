'use client';

import { useState, useEffect } from 'react';
import OrdersDetailPatch from '../test-direct/orders-detail-patch';

export default function TestOrdersIdPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = 'b65a7121-6d18-4c00-8fab-0c450110022f'; // Hardcoded for testing

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // Function to generate a cache buster parameter
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add cache buster to prevent caching
      const cacheBuster = generateCacheBuster();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${backendUrl}/orders/${orderId}?${cacheBuster}`;

      console.log(`[TestOrdersId] Fetching order details from: ${url}`);

      // Get JWT token from local storage or session
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || 
                    // Fallback to hardcoded token for testing
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzMyY2Y3NS1mNzYxLTQ4MTUtOTFiNC02MTlkMWNhOGViNWEiLCJ1c2VybmFtZSI6ImZhaG1pIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzQzMzQzNDY0LCJleHAiOjE3NDM0Mjk4NjR9.lpFBwyGZOapYEdAhtHVV6Io5Q4JYHsg3_Lsmn6Qvh6Q';

      // Make API call to backend
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TestOrdersId] Order details:', data);

      // Extract the order data from the response
      const orderData = data.data || data;
      setOrder(orderData);
    } catch (error: any) {
      console.error('[TestOrdersId] Error fetching order details:', error);
      setError(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    // Update local state immediately for better UX
    if (order) {
      setOrder({
        ...order,
        status: newStatus
      });
    }

    // Re-fetch order details after a short delay to get fresh data
    setTimeout(fetchOrderDetails, 1000);
  };

  // Get order items summary
  const getItemsSummary = (items: any[]) => {
    if (!items || !items.length) return 'No items';
    
    return items.map(item => {
      const quantity = item.quantity || 0;
      const service = item.serviceName || 'Unknown service';
      return `${quantity}x ${service}`;
    }).join(', ');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Detail Test Page</h1>
        <button 
          onClick={fetchOrderDetails} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading order details...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <h2 className="font-bold mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      ) : order ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Order #{order.orderNumber}</h2>
                <p className="text-gray-600">ID: {order.id}</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full font-medium text-sm capitalize" 
                  style={{
                    backgroundColor: getStatusColor(order.status),
                    color: 'white'
                  }}
                >
                  {order.status}
                </div>
                <p className="text-gray-600 mt-2">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <p>
              <span className="font-medium">Customer ID:</span> {order.customerId}
            </p>
            <p>
              <span className="font-medium">Name:</span> {order.customer?.name || 'Not available'}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.customer?.phone || 'Not available'}
            </p>
          </div>

          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="mb-4">
              <p>
                <span className="font-medium">Total Amount:</span> Rp{order.totalAmount?.toLocaleString() || '0'}
              </p>
              <p>
                <span className="font-medium">Total Weight:</span> {order.totalWeight || '0'} kg
              </p>
              <p>
                <span className="font-medium">Items:</span> {getItemsSummary(order.items || [])}
              </p>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item: any, index: number) => (
                      <tr key={item.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.weight || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Rp{item.price?.toLocaleString() || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Rp{item.totalPrice?.toLocaleString() || (item.price * item.quantity).toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No items found for this order</p>
            )}
          </div>

          {/* Enhanced Status Update Component */}
          <OrdersDetailPatch 
            orderId={order.id}
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      ) : (
        <div className="text-center py-8">No order data available</div>
      )}
    </div>
  );
}

// Helper function to get status color
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    new: '#3498db',
    processing: '#f39c12',
    washing: '#3498db',
    drying: '#e67e22',
    folding: '#9b59b6',
    ready: '#2ecc71',
    delivered: '#27ae60',
    cancelled: '#e74c3c'
  };

  return statusColors[status] || '#7f8c8d';
} 