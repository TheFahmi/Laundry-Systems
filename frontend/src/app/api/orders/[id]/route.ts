import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/orders/${id}: GET request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${id}: No token available`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      cache: 'no-store'
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/orders/${id}: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Unknown error',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] /api/orders/${id}: Response received from backend`);
    
    // Ensure we return data in a consistent format
    if (data) {
      // Format response for frontend consistency
      const formattedResponse = {
        statusCode: 200,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: data
      };
      
      console.log(`[API Route] /api/orders/${id}: Returning formatted response`);
      return NextResponse.json(formattedResponse);
    } else {
      console.error(`[API Route] /api/orders/${id}: Empty response from backend`);
      return NextResponse.json({ 
        error: 'Empty response from backend',
        statusCode: 500,
        message: 'Backend returned empty response'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${id}: Exception occurred:`, error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Handle PATCH request for updating order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/orders/${id}: PATCH request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${id}: No token available for PATCH`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/${id}: PATCH failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update order',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 200,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${id}: PATCH exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
}

// Handle PUT request for updating order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/orders/${id}: PUT request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${id}: No token available for PUT`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/${id}: PUT failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update order',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 200,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${id}: PUT exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
}

// Handle DELETE request for deleting order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/orders/${id}: DELETE request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${id}: No token available for DELETE`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/${id}: DELETE failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to delete order',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    return NextResponse.json({
      statusCode: 200,
      message: 'Order deleted successfully',
      timestamp: new Date().toISOString(),
      data: { id }
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${id}: DELETE exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to delete order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 