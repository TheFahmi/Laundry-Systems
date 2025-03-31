import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Define API_BASE_URL directly since we disabled rewrites
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug mode
const DEBUG_MODE = true;

// Helper to get token from request
function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from Authorization header first
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookie
  const token = getCookie(req, 'token');
  return token || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = params.orderNumber;
    console.log(`API Route: Fetching order details for: ${orderNumber}`);
    
    // Get the auth token from request
    const token = getTokenFromRequest(request);
    console.log(`Auth token exists: ${!!token}`);
    
    if (!token) {
      console.log('No auth token found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get CSRF token from cookies or headers
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value || 
                      request.headers.get('X-CSRF-Token') ||
                      request.headers.get('X-XSRF-Token');
    
    console.log(`CSRF token exists: ${!!csrfToken}`);
    
    // Instead of relying on rewrites, directly call the backend
    const apiURL = `${API_BASE_URL}/orders/by-number/${encodeURIComponent(orderNumber)}`;
    console.log(`Calling backend directly at: ${apiURL}`);
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log(`Including CSRF token in request`);
    } else {
      console.log(`No CSRF token available to include in request`);
    }

    const response = await fetch(apiURL, {
      headers,
      cache: 'no-store'
    });

    console.log(`Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Error response from backend:', errorData);
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched order data');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in order API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// Handle DELETE request for deleting order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const orderNumber = params.orderNumber;
  console.log(`[API Route] /api/orders/${orderNumber}: DELETE request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/${orderNumber}: No token available for DELETE`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/orders/by-number/${orderNumber}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/orders/${orderNumber}: DELETE failed (${response.status}):`, errorData);
      
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
      data: { orderNumber }
    });
  } catch (error: any) {
    console.error(`[API Route] /api/orders/${orderNumber}: DELETE exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to delete order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 