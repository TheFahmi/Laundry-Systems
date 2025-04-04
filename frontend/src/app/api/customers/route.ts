import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/customers: Request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/customers: No token available');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Log the request details
  console.log(`[API Route] /api/customers: Forwarding request with params: ${queryString}`);
  
  try {
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/customers?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include',
      cache: 'no-store'
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/customers: Backend error (${response.status}):`, errorText);
      
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
    console.log('[API Route] /api/customers: Response received from backend');
    
    // Ensure we return data in a consistent format matching the expected structure
    if (data) {
      // Format response for frontend consistency
      const formattedResponse = {
        data: {
          items: data.items || [],
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10
        },
        statusCode: 200,
        message: 'Success',
        timestamp: new Date().toISOString()
      };
      
      console.log('[API Route] /api/customers: Returning formatted response');
      
      // Create response with no-cache headers
      const responseWithHeaders = NextResponse.json(formattedResponse);
      responseWithHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      responseWithHeaders.headers.set('Pragma', 'no-cache');
      responseWithHeaders.headers.set('Expires', '0');
      responseWithHeaders.headers.set('Surrogate-Control', 'no-store');
      
      return responseWithHeaders;
    } else {
      console.error('[API Route] /api/customers: Empty response from backend');
      return NextResponse.json({ 
        error: 'Empty response from backend',
        statusCode: 500,
        message: 'Backend returned empty response'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API Route] /api/customers: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Handle POST request for creating a new customer
export async function POST(request: NextRequest) {
  console.log('[API Route] /api/customers: POST request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/customers: No token available for POST');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/customers`, {
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
      console.error(`[API Route] /api/customers: POST failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to create customer',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json({
      statusCode: 201,
      message: 'Customer created successfully',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error: any) {
    console.error('[API Route] /api/customers: POST exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create customer',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 