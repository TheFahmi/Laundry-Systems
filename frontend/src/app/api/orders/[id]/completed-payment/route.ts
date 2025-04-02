import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeaders } from '@/lib/api-utils';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Define payment interface
interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  referenceNumber?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mendapatkan token dari header Authorization
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
    
    // Jika token tidak ada, kembalikan error
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the order ID from the URL params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Processing payment completion for order ${id}`);
    
    // Get payment method from request body
    const requestData = await request.json().catch(() => ({}));
    const paymentMethod = requestData.paymentMethod || 'cash'; // Default to cash if not provided
    
    console.log(`[API] Payment method: ${paymentMethod}`);
    
    // 1. First, get the order to check for existing payments
    const orderResponse = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { message: errorData.message || `Failed to fetch order: ${orderResponse.status}` },
        { status: orderResponse.status }
      );
    }
    
    const orderData = await orderResponse.json();
    console.log(`[API] Order data fetched:`, orderData);
    
    // Check if there are existing payments
    const payments: Payment[] = orderData.payments || [];
    
    if (payments.length === 0) {
      return NextResponse.json(
        { message: 'No payment data found for this order' },
        { status: 400 }
      );
    }
    
    // Find pending payments to update
    const pendingPayments = payments.filter((payment: Payment) => 
      payment.status === 'pending' || payment.status === 'PENDING'
    );
    
    console.log(`[API] Found ${pendingPayments.length} pending payments`);
    
    // If no pending payments, create a response message that all payments are already completed
    if (pendingPayments.length === 0 && payments.some((p: Payment) => p.status === 'completed' || p.status === 'COMPLETED')) {
      console.log(`[API] All payments are already completed`);
      
      // Update the order payment status anyway to ensure consistency
      await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          isPaid: true
        })
      });
      
      return NextResponse.json(
        { 
          message: 'All payments are already completed',
          data: { order: orderData }
        },
        { status: 200 }
      );
    }
    
    // Process each pending payment
    const updateResults = [];
    for (const payment of pendingPayments) {
      console.log(`[API] Updating payment ${payment.id} to completed`);
      
      // Update payment status and payment method
      const paymentResponse = await fetch(`${API_BASE_URL}/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          method: paymentMethod // Menggunakan metode pembayaran yang diterima dari request
        })
      });
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        updateResults.push({ id: payment.id, success: true, data: paymentData });
      } else {
        const errorData = await paymentResponse.json().catch(() => ({ message: 'Unknown error' }));
        updateResults.push({ 
          id: payment.id, 
          success: false, 
          error: errorData.message || `Failed to update payment: ${paymentResponse.status}` 
        });
      }
    }
    
    // Update order payment status
    console.log(`[API] Updating order payment status to paid`);
    const orderUpdateResponse = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentStatus: 'paid',
        isPaid: true
      })
    });
    
    if (!orderUpdateResponse.ok) {
      const errorData = await orderUpdateResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.log(`[API] Failed to update order payment status: ${errorData.message}`);
      // Continue anyway since we've updated the payments
    } else {
      console.log(`[API] Order payment status updated successfully`);
    }
    
    return NextResponse.json(
      { 
        message: 'Payment status updated successfully',
        data: { 
          paymentUpdates: updateResults,
          allUpdatesSuccessful: updateResults.every(r => r.success)
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Error updating payment status:', error);
    
    return NextResponse.json(
      { 
        message: error.message || 'Failed to update payment status',
        error: error.response?.data || error.toString()
      },
      { status: error.response?.status || 500 }
    );
  }
} 