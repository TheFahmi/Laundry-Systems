import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/auth/csrf-token: Request received');
  
  // Get token from cookies (if available - might not be available for pre-login CSRF)
  const token = request.cookies.get('token')?.value;
  
  try {
    // Even if we don't have a token, we can request a CSRF token
    // The backend will generate a token and set the CSRF cookie
    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/auth/csrf-token: Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to get CSRF token',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] /api/auth/csrf-token: Token received');
    
    // Return the token
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] /api/auth/csrf-token: Exception:', error.message);
    return NextResponse.json({ 
      error: 'Failed to get CSRF token',
      statusCode: 500,
      message: error.message
    }, { status: 500 });
  }
} 