import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/services: Request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/services: No token available');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Log the request details
  console.log(`[API Route] /api/services: Forwarding request with params: ${queryString}`);
  
  try {
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/services${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[API Route] /api/services: Backend returned error:', response.status, errorData);
      
      // Return the error with the original status
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    
    // Create response with no-cache headers
    const formattedData = {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10
    };
    
    const responseWithHeaders = NextResponse.json({
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
      data: formattedData
    });
    
    // Add no-cache headers
    responseWithHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseWithHeaders.headers.set('Pragma', 'no-cache');
    responseWithHeaders.headers.set('Expires', '0');
    responseWithHeaders.headers.set('Surrogate-Control', 'no-store');
    
    return responseWithHeaders;
  } catch (error) {
    console.error('[API Route] /api/services: Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// Handle POST request for creating a new service
export async function POST(request: NextRequest) {
  console.log('[API Route] /api/services: POST request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/services: No token available for POST');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
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
      console.error(`[API Route] /api/services: POST failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to create service',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    const responseWithHeaders = NextResponse.json({
      statusCode: 201,
      message: 'Service created successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
    
    // Add no-cache headers
    responseWithHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseWithHeaders.headers.set('Pragma', 'no-cache');
    responseWithHeaders.headers.set('Expires', '0');
    responseWithHeaders.headers.set('Surrogate-Control', 'no-store');
    
    return responseWithHeaders;
  } catch (error: any) {
    console.error('[API Route] /api/services: POST exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create service',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 