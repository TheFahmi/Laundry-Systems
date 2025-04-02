import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeaders } from '@/lib/api-utils';

// Backend API base URL - ensure it's correct
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Get ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const requestData = await request.json();
    const { status } = requestData;

    console.log(`Updating order status for Order ID ${id}`, { 
      status
    });

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Create auth headers
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Create headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Generate cache buster for request
    const cacheBuster = `_cb=${Date.now()}`;
    
    // PATCH directly to the order endpoint
    console.log(`Sending PATCH request to update order: ${API_BASE_URL}/orders/${id}`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/orders/${id}?${cacheBuster}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
      cache: 'no-store'
    });

    // Handle error responses
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`Status update failed with code: ${updateResponse.status}`, errorData);
      
      return NextResponse.json(
        { 
          message: errorData.message || `Failed to update order status: ${updateResponse.status}`,
          error: errorData.error || null,
          details: errorData
        },
        { status: updateResponse.status }
      );
    }

    // Parse successful response
    const responseData = await updateResponse.json();
    console.log('Status update successful:', responseData);
    
    return NextResponse.json({
      message: 'Order status updated successfully',
      data: responseData
    });
    
  } catch (error: any) {
    console.error('Error updating order status:', error);
    
    return NextResponse.json(
      { 
        message: error.message || 'Failed to update order status',
        error: error
      },
      { status: 500 }
    );
  }
} 