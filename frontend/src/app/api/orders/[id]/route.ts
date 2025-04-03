import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';
import { cookies } from 'next/headers';

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

/**
 * GET handler for order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authentication token from cookies or Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is authenticated
    if (!token) {
      console.log('[api/orders/[id]] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log the request
    console.log(`[api/orders/[id]] Fetching order details for ID: ${params.id}`);

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    // Get response data
    const data = await response.json();

    // Handle different response statuses
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[api/orders/[id]] Order not found: ${params.id}`);
        return NextResponse.json(
          { message: 'Order not found' },
          { status: 404 }
        );
      }
      
      if (response.status === 401) {
        console.log('[api/orders/[id]] Unauthorized');
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        console.log('[api/orders/[id]] Forbidden - User cannot access this order');
        return NextResponse.json(
          { message: 'Forbidden - You do not have permission to access this order' },
          { status: 403 }
        );
      }
      
      console.log(`[api/orders/[id]] Backend API error: ${response.status}`);
      return NextResponse.json(
        { message: 'Error fetching order details', error: data },
        { status: response.status }
      );
    }

    // Return successful response
    console.log(`[api/orders/[id]] Successfully fetched order details for ID: ${params.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/orders/[id]] Error in GET handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for order cancellation
 * Endpoint: /api/orders/[id]/cancel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, get the URL path to check if it's a cancel request
    const pathParts = request.nextUrl.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Only handle cancel requests here
    if (lastPart !== 'cancel') {
      return NextResponse.json(
        { message: 'Method not allowed' },
        { status: 405 }
      );
    }
    
    // Get authentication token from cookies or Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is authenticated
    if (!token) {
      console.log('[api/orders/[id]/cancel] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log the request
    console.log(`[api/orders/[id]/cancel] Cancelling order: ${params.id}`);

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Get response data
    const data = await response.json();

    // Handle different response statuses
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[api/orders/[id]/cancel] Order not found: ${params.id}`);
        return NextResponse.json(
          { message: 'Order not found' },
          { status: 404 }
        );
      }
      
      if (response.status === 401) {
        console.log('[api/orders/[id]/cancel] Unauthorized');
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        console.log('[api/orders/[id]/cancel] Forbidden - User cannot access this order');
        return NextResponse.json(
          { message: 'Forbidden - You do not have permission to cancel this order' },
          { status: 403 }
        );
      }

      if (response.status === 400) {
        console.log('[api/orders/[id]/cancel] Bad request - Order cannot be cancelled');
        return NextResponse.json(
          { message: data.message || 'Order cannot be cancelled at this stage' },
          { status: 400 }
        );
      }
      
      console.log(`[api/orders/[id]/cancel] Backend API error: ${response.status}`);
      return NextResponse.json(
        { message: 'Error cancelling order', error: data },
        { status: response.status }
      );
    }

    // Return successful response
    console.log(`[api/orders/[id]/cancel] Successfully cancelled order: ${params.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/orders/[id]/cancel] Error in POST handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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

// Handle PUT request for updating order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[API Route] PUT /api/orders/${params.id}: Request received`);
  
  try {
    // Get token from cookies or Authorization header
    const token = getTokenFromRequest(request);
    
    if (!token) {
      console.log(`[API Route] PUT /api/orders/${params.id}: No token available`);
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }
    
    // Get the request body
    const body = await request.json();
    console.log(`[API Route] PUT /api/orders/${params.id}: Request body:`, body);
    
    // Forward request to backend - using PATCH instead of PUT for backend API
    console.log(`[API Route] Calling backend API: PATCH ${API_BASE_URL}/orders/${params.id}`);
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      method: 'PATCH', // Using PATCH since the backend expects PATCH
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] PUT /api/orders/${params.id}: Failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update order',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    console.log(`[API Route] PUT /api/orders/${params.id}: Success:`, responseData);
    
    // Return successful response
    return NextResponse.json({
      statusCode: 200,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
      data: responseData
    });
  } catch (error: any) {
    console.error(`[API Route] PUT /api/orders/${params.id}: Exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update order',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 