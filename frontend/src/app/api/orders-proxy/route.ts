import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get token from cookies in the request
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('Orders Proxy: No token available');
    return NextResponse.json({ error: 'No token available' }, { status: 401 });
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const queryString = searchParams.toString();
  
  try {
    console.log('Orders Proxy: Fetching CSRF token first');
    
    // First, fetch a fresh CSRF token
    const csrfResponse = await fetch('http://localhost:3001/auth/csrf-token', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!csrfResponse.ok) {
      const errorText = await csrfResponse.text();
      console.error('Orders Proxy: Failed to fetch CSRF token:', errorText);
      return NextResponse.json({ error: 'Failed to fetch CSRF token' }, { status: csrfResponse.status });
    }
    
    const csrfData = await csrfResponse.json();
    let csrfToken;
    
    // Check different response formats
    if (csrfData.csrfToken) {
      csrfToken = csrfData.csrfToken;
    } else if (csrfData.data && csrfData.data.csrfToken) {
      csrfToken = csrfData.data.csrfToken;
    } else {
      console.error('Orders Proxy: CSRF token missing in response:', csrfData);
      return NextResponse.json({ error: 'CSRF token missing in response' }, { status: 500 });
    }
    
    console.log('Orders Proxy: Successfully obtained CSRF token');
    
    // Now forward the request to the backend with the fresh CSRF token
    console.log(`Orders Proxy: Forwarding request to backend with CSRF token`);
    
    // Forward the request to the backend
    const response = await fetch(`http://localhost:3001/orders?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        // Try to parse as JSON
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        // If not JSON, use as string
        errorDetails = errorText;
      }
      
      console.log(`Orders Proxy: Backend responded with ${response.status}`);
      console.log('Error details:', errorDetails);
      
      return NextResponse.json(
        { 
          error: `Backend responded with ${response.status}`,
          details: errorDetails,
          message: typeof errorDetails === 'object' && errorDetails?.message ? 
                   errorDetails.message : 
                   'Request to backend failed'
        }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Orders Proxy: Successfully retrieved orders');
    console.log('Orders data structure:', Object.keys(data));
    
    // Make sure we have data in the expected format
    if (data && data.items && Array.isArray(data.items)) {
      console.log(`Orders Proxy: Found ${data.items.length} orders, returning data`);
      return NextResponse.json(data);
    } else if (data && Array.isArray(data)) {
      console.log(`Orders Proxy: Found ${data.length} orders in array format, wrapping in items structure`);
      return NextResponse.json({
        items: data,
        total: data.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } else {
      console.log(`Orders Proxy: Unexpected data format:`, data);
      return NextResponse.json(data); // Return as-is and let frontend handle it
    }
  } catch (error: any) {
    console.error('Orders Proxy Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to proxy orders request',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 