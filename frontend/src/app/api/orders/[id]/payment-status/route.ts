import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    // Check authentication
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
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
    
    // Parse the request body
    const data = await request.json();
    
    // Update the order payment status in the backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentStatus: data.paymentStatus || 'paid',
        isPaid: data.isPaid !== undefined ? data.isPaid : true,
        paymentMethod: data.paymentMethod
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to update payment status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    return NextResponse.json(
      { 
        message: 'Payment status updated successfully',
        data: responseData
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    
    return NextResponse.json(
      { 
        message: error.message || 'Failed to update payment status',
        error: error.response?.data || error.toString()
      },
      { status: error.response?.status || 500 }
    );
  }
} 