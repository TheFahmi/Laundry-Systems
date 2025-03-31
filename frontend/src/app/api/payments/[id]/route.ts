import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

// GET handler for /api/payments/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[API Route] /api/payments/${params.id}: GET request received`);
  
  // Get token from cookies (if available)
  const token = getTokenFromRequest(request);
  
  if (!token) {
    console.log('[API Route] No auth token found in request');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    console.log(`[API Route] Fetching payment details for ID: ${params.id}`);
    
    // Build proper authorization headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/payments/${params.id}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/payments/${params.id}: Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to fetch payment',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] Payment received:`, data);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API Route] /api/payments/${params.id}: Exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch payment',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
}

// PUT handler for /api/payments/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[API Route] /api/payments/${params.id}: PUT request received`);
  
  // Get token using helper
  const token = getTokenFromRequest(request);
  
  if (!token) {
    console.log('[API Route] No auth token found in request');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    console.log(`[API Route] Update payment request body:`, body);
    
    // Build proper authorization headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/payments/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/payments/${params.id}: Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to update payment',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] Payment updated:`, data);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API Route] /api/payments/${params.id}: Exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update payment',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
}

// DELETE handler for /api/payments/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[API Route] /api/payments/${params.id}: DELETE request received`);
  
  // Get token using helper
  const token = getTokenFromRequest(request);
  
  if (!token) {
    console.log('[API Route] No auth token found in request');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    // Build proper authorization headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/payments/${params.id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/payments/${params.id}: Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to delete payment',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] Payment deleted:`, data);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API Route] /api/payments/${params.id}: Exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to delete payment',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 