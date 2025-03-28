import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get token from cookies in the request
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('CSRF Proxy: No token available');
    return NextResponse.json({ error: 'No token available' }, { status: 401 });
  }
  
  try {
    console.log('CSRF Proxy: Forwarding request to backend at http://localhost:3001/auth/csrf-token');
    console.log(`Authorization: Bearer ${token.substring(0, 15)}...`);
    
    // Forward the request to the backend
    const response = await fetch('http://localhost:3001/auth/csrf-token', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Required for actual JWT in the body
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`CSRF Proxy: Backend responded with ${response.status} - ${text}`);
      return NextResponse.json(
        { error: `Backend responded with ${response.status}`, details: text }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('CSRF Proxy: Successfully retrieved CSRF token');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('CSRF Proxy Error:', error.message);
    // More detailed error response
    return NextResponse.json({ 
      error: 'Failed to fetch CSRF token from backend', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 