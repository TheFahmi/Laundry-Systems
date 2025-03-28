import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Get token from cookies in the request
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ 
      success: false, 
      message: 'No authentication token provided' 
    }, { status: 401 });
  }
  
  // Get CSRF token from header
  const csrfToken = request.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return NextResponse.json({ 
      success: false, 
      message: 'No CSRF token provided in header' 
    }, { status: 403 });
  }
  
  // Check for request body
  let body = null;
  try {
    body = await request.json();
  } catch (error) {
    // No body or invalid JSON
  }
  
  // Return success with details for debugging
  return NextResponse.json({
    success: true,
    message: 'CSRF validation successful',
    tokenLength: token.length,
    csrfTokenLength: csrfToken.length,
    body: body || {},
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      'cookie-count': request.cookies.getAll().length
    }
  });
} 