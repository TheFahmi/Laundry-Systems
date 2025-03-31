import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler to validate JWT token
 */
export async function GET(req: NextRequest) {
  console.log('[API] Token validation request received');
  
  try {
    // Get API URL from environment variable with fallback
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      console.log('[API] No token found in cookies for validation');
      return NextResponse.json(
        { valid: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Create the request to the backend
    const validateResponse = await fetch(`${API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    // If the response is successful, the token is valid
    if (validateResponse.ok) {
      // Get any user data from the response
      const userData = await validateResponse.json();
      
      // Create a success response
      const response = NextResponse.json(
        { valid: true, user: userData.user },
        { status: 200 }
      );
      
      // Set cache control headers to allow caching the validation result
      // This reduces unnecessary validation calls
      response.headers.set('Cache-Control', 'private, max-age=3600'); // 1 hour
      
      console.log('[API] Token validated successfully');
      return response;
    } else {
      console.log('[API] Token validation failed with status:', validateResponse.status);
      
      // Try to get the error message
      let errorMessage = 'Token validation failed';
      try {
        const errorData = await validateResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Unable to parse JSON error, use default message
      }
      
      return NextResponse.json(
        { valid: false, message: errorMessage },
        { status: validateResponse.status }
      );
    }
  } catch (error) {
    console.error('[API] Token validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Error validating token' },
      { status: 500 }
    );
  }
} 