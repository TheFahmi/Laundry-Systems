import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/services/${id}: GET request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/services/${id}: No token available`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
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
      console.error(`[API Route] /api/services/${id}: Backend error (${response.status}):`, errorText);
      
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
    console.log(`[API Route] /api/services/${id}: Response received from backend`);
    
    // Return service data with no-cache headers
    const responseWithHeaders = NextResponse.json({
      statusCode: 200,
      message: 'Success',
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
    console.error(`[API Route] /api/services/${id}: Exception occurred:`, error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// UPDATE service by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/services/${id}: PUT request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/services/${id}: No token available for PUT`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
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
      console.error(`[API Route] /api/services/${id}: PUT failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to update service',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const data = await response.json();
    const responseWithHeaders = NextResponse.json({
      statusCode: 200,
      message: 'Service updated successfully',
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
    console.error(`[API Route] /api/services/${id}: PUT exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update service',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE service by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API Route] /api/services/${id}: DELETE request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/services/${id}: No token available for DELETE`);
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  try {
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      }
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`[API Route] /api/services/${id}: DELETE failed (${response.status}):`, errorData);
      
      return NextResponse.json({ 
        error: 'Failed to delete service',
        statusCode: response.status,
        message: errorData.message || 'Unknown error',
        details: errorData
      }, { status: response.status });
    }
    
    // Return successful response
    const responseWithHeaders = NextResponse.json({
      statusCode: 200,
      message: 'Service deleted successfully',
      timestamp: new Date().toISOString()
    });
    
    // Add no-cache headers
    responseWithHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseWithHeaders.headers.set('Pragma', 'no-cache');
    responseWithHeaders.headers.set('Expires', '0');
    responseWithHeaders.headers.set('Surrogate-Control', 'no-store');
    
    return responseWithHeaders;
  } catch (error: any) {
    console.error(`[API Route] /api/services/${id}: DELETE exception:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to delete service',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 