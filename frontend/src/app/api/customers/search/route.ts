import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/customers/search: Request received');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('[API Route] /api/customers/search: No token available');
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  // Get CSRF token from request headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  // Get search query from request
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }
  
  console.log(`[API Route] /api/customers/search: Searching for "${query}"`);
  
  try {
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`, {
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
      console.error(`[API Route] /api/customers/search: Backend error (${response.status}):`, errorText);
      
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
    console.log('[API Route] /api/customers/search: Response received from backend');
    
    // Return formatted response with no-cache headers
    const responseWithHeaders = NextResponse.json({
      data: data,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString()
    });
    
    // Add cache control headers
    responseWithHeaders.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseWithHeaders.headers.set('Pragma', 'no-cache');
    responseWithHeaders.headers.set('Expires', '0');
    responseWithHeaders.headers.set('Surrogate-Control', 'no-store');
    
    return responseWithHeaders;
  } catch (error: any) {
    console.error('[API Route] /api/customers/search: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 