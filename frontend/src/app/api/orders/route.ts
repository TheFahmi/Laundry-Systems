import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/orders: GET request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/orders: No token available for GET');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    console.log('[API Route] /api/orders: Query params:', queryParams);
    
    // Forward request to backend
    console.log('[API Route] /api/orders: Forwarding request to backend');
    const response = await fetch(`${API_BASE_URL}/orders${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders: GET failed (${response.status}):`, errorData);
      
      // Check for JWT specific errors
      if (response.status === 401) {
        console.log('[API Route] /api/orders: Authentication failed with 401');
        
        // Check for specific JWT expired error
        if (errorData.message?.includes('expired')) {
          console.log('[API Route] /api/orders: JWT token expired error detected');
          
          return NextResponse.json({ 
            error: 'Authentication failed',
            statusCode: 401,
            message: 'Your session has expired. Please log in again.',
            tokenExpired: true
          }, { status: 401 });
        }
      
        // For other authentication errors
        return NextResponse.json({ 
          error: 'Authentication failed',
          statusCode: 401,
          message: 'Your session has expired. Please log in again.',
          redirectToLogin: true
        }, { status: 401 });
      }
      
      // For other errors
      return NextResponse.json({ 
        error: 'Failed to fetch orders',
        statusCode: response.status,
        message: errorData.message || 'Unknown error'
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    console.log('[API Route] /api/orders: Response received from backend');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] /api/orders: Exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[API Route] /api/orders: POST request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/orders: No token available for POST');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    console.log('[API Route] /api/orders: Forwarding POST request to backend');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders: POST failed (${response.status}):`, errorData);
      
      // Check for JWT expired error
      if (response.status === 401 && errorData.message?.includes('expired')) {
        console.log('[API Route] /api/orders: JWT token expired error detected in POST');
        
        return NextResponse.json({ 
          error: 'Authentication failed',
          statusCode: 401,
          message: 'Your session has expired. Please log in again.',
          tokenExpired: true
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create order',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 201,
      message: 'Order created successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error('[API Route] /api/orders: POST exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 