import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEBUG_MODE = true;

// Helper to get token from request
function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from Authorization header first
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookie
  const token = getCookie(req, 'token');
  return token || null;
}

// Helper untuk decode token JWT tanpa validasi
const decodeJWT = (token: string) => {
  try {
    const [headerB64, payloadB64] = token.split('.');
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('[JWT] Token decode error:', error);
    return null;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    console.log(`[API Route] Fetching order details for ID: ${orderId}`);
    
    // Get the auth token from request
    const token = getTokenFromRequest(request);
    console.log(`Auth token exists: ${!!token}`);
    
    if (!token) {
      console.log('No auth token found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Debug token information
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        console.log('Token payload:', payload);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp) {
          const timeLeft = payload.exp - now;
          console.log(`Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
          console.log(`Current time: ${new Date().toLocaleString()}`);
          console.log(`Time left: ${timeLeft} seconds`);
          
          if (timeLeft < 0) {
            console.log(`Token expired ${Math.abs(timeLeft)} seconds ago`);
          }
        }
      }
    }
    
    // Get CSRF token from cookies or headers
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value || 
                      request.headers.get('X-CSRF-Token') ||
                      request.headers.get('X-XSRF-Token');
    
    console.log(`CSRF token exists: ${!!csrfToken}`);
    
    // URL for the backend API
    const apiURL = `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`;
    console.log(`Calling backend directly at: ${apiURL}`);
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
    
    // Set up headers for the request
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log(`Including CSRF token in request`);
    } else {
      console.log(`No CSRF token available to include in request`);
    }
    
    // Make the request
    const response = await fetch(apiURL, {
      headers,
      cache: 'no-store'
    });
    
    console.log(`Backend response status: ${response.status}`);
    
    // Handle non-successful responses
    if (!response.ok) {
      console.log(`Error response: ${response.status} ${response.statusText}`);
      
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        console.log('Received 401 Unauthorized from backend');
        
        // Log detailed error information for debugging
        console.log('-----------------------------');
        console.log('ORDER DETAIL API ERROR 401');
        console.log('Backend URL:', apiURL);
        console.log('Request Headers:', headers);
        
        try {
          const errorBody = await response.text();
          console.log('Error Response Body:', errorBody);
          
          try {
            const errorJson = JSON.parse(errorBody);
            console.log('Error JSON:', errorJson);
          } catch (e) {
            console.log('Failed to parse error as JSON');
          }
        } catch (e) {
          console.log('Failed to read error response body');
        }
        
        console.log('-----------------------------');
        
        // Return detailed error for debugging
        return NextResponse.json(
          { 
            error: 'Authentication error', 
            message: 'Token validation failed with the backend',
            debug: true,
            timestamp: new Date().toISOString(),
            requestUrl: apiURL,
          },
          { status: 401 }
        );
      }
      
      // For other errors
      try {
        const errorData = await response.json();
        console.error('Error response from backend:', errorData);
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      } catch (e) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        return NextResponse.json(
          { error: 'Failed to fetch order details', message: errorText },
          { status: response.status }
        );
      }
    }
    
    // Parse and return the data
    const data = await response.json();
    console.log('Successfully fetched order data');
    
    // Return standardized format that our frontend expects
    return NextResponse.json({
      statusCode: 200,
      message: 'Order details fetched successfully',
      data: data
    });
  } catch (error: any) {
    console.error('Error in order API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch order details',
        message: error.message,
        stack: DEBUG_MODE ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 