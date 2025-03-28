import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

// Set dynamic route handler config
export const dynamic = 'force-dynamic';

// Common handler for all HTTP methods
async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Get full path
  const path = pathSegments.join('/');
  
  // Get query string
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  // Build full URL
  const url = `http://localhost:3001/${path}${queryString}`;
  
  // Log request details
  console.log(`API Proxy: ${method} ${url}`);
  
  try {
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add CSRF token for ALL requests (including GET)
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log(`API Proxy: Including CSRF token in ${method} ${path}`);
    } else {
      // Try to get CSRF token from sessionStorage if running on client side
      if (typeof sessionStorage !== 'undefined') {
        const storedCsrfToken = sessionStorage.getItem('csrfToken');
        if (storedCsrfToken) {
          headers['X-CSRF-Token'] = storedCsrfToken;
          console.log(`API Proxy: Including CSRF token from sessionStorage in ${method} ${path}`);
        } else {
          console.warn(`API Proxy: No CSRF token available for ${method} ${path}`);
        }
      }
    }
    
    // Get request body for non-GET methods
    let body = null;
    if (method !== 'GET' && request.body) {
      const text = await request.text();
      body = text ? text : null;
    }
    
    // Make request to backend
    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: 'no-store'
    });
    
    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Create the response
    const result = NextResponse.json(
      responseData,
      { status: response.status }
    );
    
    // Copy headers from backend response
    response.headers.forEach((value, key) => {
      if (key !== 'content-length' && key !== 'connection') {
        result.headers.set(key, value);
      }
    });
    
    return result;
  } catch (error: any) {
    console.error(`API Proxy Error (${method} ${path}):`, error.message);
    
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message: error.message,
        method,
        path,
        url
      },
      { status: 500 }
    );
  }
} 