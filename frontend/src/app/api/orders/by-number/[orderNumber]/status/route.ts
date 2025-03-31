import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Handle PATCH request for updating order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const orderNumber = params.orderNumber;
  console.log(`[API Route] /api/orders/by-number/${orderNumber}/status: PATCH request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/by-number/${orderNumber}/status: No token available for PATCH`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Status is required' 
      }, { status: 400 });
    }
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/by-number/${orderNumber}/status: PATCH failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update order status',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const responseData = await response.json();
    return NextResponse.json({
      statusCode: 200,
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString(),
      data: responseData
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/by-number/${orderNumber}/status: PATCH exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update order status',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 