import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Handle PATCH request for updating order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/orders/${id}/status: PATCH request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${id}/status: No token available for PATCH`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/${id}/status: PATCH failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update order status',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 200,
      message: 'Order status updated successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${id}/status: PATCH exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update order status',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 