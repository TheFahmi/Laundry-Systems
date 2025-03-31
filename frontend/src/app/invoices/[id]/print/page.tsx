'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { createAuthHeaders } from '@/lib/api-utils';

interface OrderItem {
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: string;
  payments?: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    referenceNumber?: string;
  }>;
}

// Debug helper
const debugLog = (message: string, data: any = {}) => {
  console.log(`[InvoicePrint] ${message}`, data);
  try {
    // Log extra debug info in development
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined') {
        (window as any).debugData = (window as any).debugData || [];
        (window as any).debugData.push({ message, data, timestamp: new Date() });
      }
    }
  } catch (e) {
    console.error('Debug logging error:', e);
  }
};

export default function InvoicePrintPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const headers = createAuthHeaders();
        debugLog('Fetching order details', { orderId: params.id });
        
        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status}`);
        }

        const data = await response.json();
        debugLog('Raw order data received', data);
        
        // Check for nested data structures
        let rawOrderData = data;
        if (data.data) {
          rawOrderData = data.data;
          debugLog('Found first level data property', { hasSecondLevel: !!rawOrderData.data });
          
          if (rawOrderData.data) {
            rawOrderData = rawOrderData.data;
            debugLog('Found second level data property', rawOrderData);
          }
        }
        
        // Process data to ensure all values are valid
        const processedOrder = {
          ...rawOrderData,
          items: (rawOrderData.items || []).map((item: OrderItem) => {
            debugLog('Processing item', item);
            // Get the correct price and quantity values
            const basePrice = Number(item.price) || 0;
            const quantity = item.weightBased 
              ? Number(item.weight) || 0 
              : Number(item.quantity) || 0;
            
            // Calculate the correct subtotal
            let subtotal: number;
            if (item.subtotal && !isNaN(item.subtotal)) {
              subtotal = Number(item.subtotal);
            } else {
              subtotal = basePrice * quantity;
            }
            
            debugLog('Item calculated values', { 
              basePrice, quantity, subtotal, 
              originalSubtotal: item.subtotal
            });
            
            return {
              ...item,
              price: basePrice,
              quantity: item.weightBased ? item.quantity : quantity, // Keep original quantity
              weight: item.weightBased ? quantity : undefined, // Set calculated weight
              subtotal: subtotal
            };
          }),
          // Calculate or validate total
          total: Number(rawOrderData.total) || (rawOrderData.items || []).reduce((sum: number, item: OrderItem) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = item.weightBased 
              ? Number(item.weight) || 0 
              : Number(item.quantity) || 0;
            const itemSubtotal = Number(item.subtotal) || (itemPrice * itemQuantity);
            return sum + itemSubtotal;
          }, 0)
        };
        
        debugLog('Processed order data', processedOrder);
        setOrder(processedOrder);
        
        // Automatically trigger print when data is loaded
        setTimeout(() => {
          window.print();
        }, 1000); // Give more time for rendering
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    // Handle NaN or invalid values by returning 0
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0';
    }
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: id });
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: Record<string, string> = {
      'cash': 'Tunai',
      'bank_transfer': 'Transfer Bank',
      'ewallet': 'E-Wallet',
      'other': 'Lainnya'
    };
    return methodLabels[method] || method;
  };

  return (
    <div className="max-w-[80mm] mx-auto p-2 bg-white">
      {/* Debug section (only visible in non-print mode) */}
      <div className="print:hidden mb-4 p-2 bg-gray-100 rounded text-xs">
        <h3 className="font-bold">Debug Info (not visible when printed)</h3>
        <p>Order ID: {order.id}</p>
        <p>Total Items: {order.items.length}</p>
        <p>Order Total: {order.total}</p>
        <button 
          onClick={() => window.print()} 
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
        >
          Print Now
        </button>
      </div>
      
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">LAUNDRY INVOICE</h1>
        <p className="text-xs text-gray-600">
          {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Order and Customer Info */}
      <div className="mb-4">
        <div className="text-xs">
          <p>No: {order.orderNumber}</p>
          <p>Tanggal: {formatDate(order.createdAt)}</p>
          <p className="font-semibold">Pelanggan: {order.customer.name}</p>
          {order.customer.phone && <p>Telp: {order.customer.phone}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-4 text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1">Layanan</th>
            <th className="text-right py-1">Jml</th>
            <th className="text-right py-1">Harga</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => {
            // For display purposes, show the correct unit price and quantity
            const isWeightBased = !!item.weightBased;
            const displayQuantity = isWeightBased ? (Number(item.weight) || 0) : (Number(item.quantity) || 0);
            
            // Calculate the proper unit price and subtotal
            let displayPrice = Number(item.price) || 0;
            let displaySubtotal = Number(item.subtotal) || 0;
            
            // If subtotal seems incorrect or is not provided, recalculate it
            if (displaySubtotal === 0 || Math.abs(displaySubtotal - (displayPrice * displayQuantity)) > 1) {
              displaySubtotal = displayPrice * displayQuantity;
            }
            
            // Debug the values shown
            debugLog(`Item ${index} display values:`, {
              name: item.serviceName,
              isWeightBased,
              displayQuantity,
              displayPrice,
              displaySubtotal,
              originalPrice: item.price,
              originalSubtotal: item.subtotal
            });
            
            return (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1">{item.serviceName}</td>
                <td className="text-right py-1">
                  {isWeightBased ? `${displayQuantity}kg` : displayQuantity}
                </td>
                <td className="text-right py-1">
                  Rp{formatCurrency(displayPrice)}
                </td>
                <td className="text-right py-1">
                  Rp{formatCurrency(displaySubtotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 font-semibold">
            <td colSpan={3} className="py-1 text-right">Total</td>
            <td className="py-1 text-right">
              Rp{formatCurrency(
                // Get the total either from order.total or by summing the displayed subtotals
                (!isNaN(order.total) && order.total > 0) ? 
                  order.total : 
                  order.items.reduce((sum, item) => {
                    const isWeightBased = !!item.weightBased;
                    const quantity = isWeightBased ? (Number(item.weight) || 0) : (Number(item.quantity) || 0);
                    const price = Number(item.price) || 0;
                    const subtotal = Number(item.subtotal) || (price * quantity);
                    return sum + subtotal;
                  }, 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Information */}
      {order.payments && order.payments.length > 0 && (
        <div className="mb-4 text-xs">
          <div className="border-t border-gray-200 pt-2">
            <p className="font-semibold">Pembayaran:</p>
            {order.payments.map((payment, index) => (
              <div key={index} className="flex justify-between">
                <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                <span>Rp{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mb-4 text-xs">
          <p className="font-semibold">Catatan:</p>
          <p className="text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-4 border-t border-gray-200 pt-4">
        <p>Terima kasih telah menggunakan jasa laundry kami</p>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          
          .max-w-\\[80mm\\] {
            max-width: 80mm !important;
          }
          
          .p-2 {
            padding: 4px !important;
          }
        }
      `}</style>
    </div>
  );
} 