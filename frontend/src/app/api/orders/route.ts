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
      
      // Check for "User not found" error specifically - this indicates a token mismatch
      if (response.status === 401 && 
          (errorData.message === 'User not found' || 
           errorData.message?.includes('not found'))) {
        console.log('[API Route] User ID mismatch detected. Trying to fix token...');
        
        // Try to extract username from the token (if possible)
        let username = '';
        try {
          // Basic JWT parsing to get the payload
          const payloadBase64 = token.split('.')[1];
          const payload = JSON.parse(atob(payloadBase64));
          username = payload.username || '';
          console.log(`[API Route] Extracted username from token: ${username}`);
        } catch (parseError) {
          console.error('[API Route] Failed to parse token:', parseError);
        }
        
        // Suggest client to fix the token using username
        return NextResponse.json({ 
          error: 'Authentication failed',
          statusCode: 401,
          message: 'User token mismatch. Try logging in again.',
          fixToken: true,
          username: username || 'fahmi' // Fallback to 'fahmi' if we couldn't extract
        }, { status: 401 });
      }
      
      // If we get a regular 401, redirect to login
      if (response.status === 401) {
        console.log('[API Route] Authorization failed - redirecting to login');
        // Return a special error for 401 that will trigger a redirect on the client
        return NextResponse.json({ 
          error: 'Authentication failed',
          statusCode: 401,
          message: 'Your session has expired. Please log in again.',
          redirectToLogin: true
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch orders',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 200,
      message: 'Orders fetched successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error('[API Route] /api/orders: GET exception:', error.message);
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
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    console.log('[API Route] /api/orders: Original request body:', JSON.stringify(body));
    
    // Ensure all numeric values are actually numbers
    const items = Array.isArray(body.items) ? body.items.map((item: any) => ({
      ...item,
      serviceId: String(item.serviceId),
      price: Number(item.price),
      quantity: Number(item.quantity),
      ...(item.weight !== undefined && { weight: Number(item.weight) })
    })) : body.items;

    // Create a modified payload - keep the original customerId now that the backend accepts it
    const modifiedBody = {
      ...body,
      items,
      // Use the original customerId
      customerId: body.customerId,
      total: Number(body.total),
      payment: body.payment ? {
        ...body.payment,
        amount: Number(body.payment.amount),
        change: Number(body.payment.change)
      } : body.payment
    };

    console.log('[API Route] /api/orders: Modified request body:', JSON.stringify(modifiedBody));
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(modifiedBody)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders: POST failed (${response.status}):`, errorData);
      
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