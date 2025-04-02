import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';
const DEBUG_MODE = true;

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

// Handle expired tokens with regeneration
async function handleExpiredToken(token: string, request: NextRequest) {
  console.log('[API Route] Token appears to be expired, regenerating new token');
  
  try {
    // Decode token to get user information
    const payload = decodeJWT(token);
    if (!payload || !payload.username || (!payload.userId && !payload.sub)) {
      console.log('[API Route] Cannot regenerate token - missing payload information');
      return null;
    }
    
    // Create new token with extended expiration
    const secret = new TextEncoder().encode(JWT_SECRET);
    const newToken = await new SignJWT({
      username: payload.username,
      userId: payload.userId || payload.sub,
      role: payload.role || 'user',
      sub: payload.userId || payload.sub  // Include sub for backend compatibility
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // 30 days
      .sign(secret);
    
    console.log('[API Route] Generated new token with 30 day expiration');
    
    // Create response with the new token
    const newResponse = NextResponse.json({ 
      success: true,
      message: 'Token regenerated',
      regenerated: true,
      token: newToken
    });
    
    // Set the new token in cookies
    newResponse.cookies.set({
      name: 'token',
      value: newToken,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Also store in localStorage as backup
    const script = `
      try {
        localStorage.setItem('token_backup', '${newToken}');
        console.log('[Auth] Saved regenerated token to backup storage');
      } catch (e) {
        console.error('[Auth] Failed to save token backup:', e);
      }
    `;
    
    // Inject script tag to update localStorage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Regenerated</title>
          <script>${script}</script>
          <meta http-equiv="refresh" content="0;url=${request.nextUrl.pathname}">
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
    `;
    
    return {
      response: new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': `token=${newToken}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax;`
        }
      }),
      token: newToken
    };
  } catch (error) {
    console.error('[API Route] Token regeneration error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[API Route] /api/orders: GET request received');
    
    // Get token
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
    let tokenExpired = false;
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
            tokenExpired = true;
          }
        }
      }
    }
    
    // If token is already expired, regenerate it first
    if (tokenExpired) {
      console.log('[API Route] Token already expired, regenerating before making request');
      const regenerationResult = await handleExpiredToken(token, request);
      if (regenerationResult) {
        return regenerationResult.response;
      }
    }
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Parse and validate page and limit parameters
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    console.log(`Raw pagination parameters - page: ${pageParam}, limit: ${limitParam}`);

    // Create a new URLSearchParams object for the backend request
    const backendParams = new URLSearchParams();

    // Copy all original parameters to the new params object
    searchParams.forEach((value, key) => {
      // Skip page and limit for now, we'll handle them separately
      if (key !== 'page' && key !== 'limit') {
        backendParams.append(key, value);
      }
    });

    // Ensure page and limit are valid numbers or use defaults
    let page = 0;
    let limit = 10;

    try {
      if (pageParam !== null) {
        const parsedPage = parseInt(pageParam, 10);
        console.log(`Parsing page parameter: ${pageParam} => ${parsedPage} (isNaN: ${isNaN(parsedPage)})`);
        if (!isNaN(parsedPage)) {
          page = parsedPage;
        }
      }
      
      if (limitParam !== null) {
        const parsedLimit = parseInt(limitParam, 10);
        console.log(`Parsing limit parameter: ${limitParam} => ${parsedLimit} (isNaN: ${isNaN(parsedLimit)})`);
        if (!isNaN(parsedLimit)) {
          limit = parsedLimit;
        }
      }
    } catch (e) {
      console.error('Error parsing pagination parameters:', e);
    }

    // Add validated page and limit parameters to the backend request
    backendParams.append('page', page.toString());
    backendParams.append('limit', limit.toString());

    console.log(`Final pagination parameters - page: ${page}, limit: ${limit}`);

    // Create the final query string
    const finalQueryString = backendParams.toString();
    const queryParams = finalQueryString ? `?${finalQueryString}` : '';

    // URL for the backend API
    const apiURL = `${API_BASE_URL}/orders${queryParams}`;
    console.log(`Calling backend directly at: ${apiURL}`);
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
    
    // Get CSRF token from cookies or headers
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value || 
                      request.headers.get('X-CSRF-Token') ||
                      request.headers.get('X-XSRF-Token');
    
    console.log(`CSRF token exists: ${!!csrfToken}`);
    
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
        
        // Regenerate token on 401 error if not already tried
        if (!tokenExpired) {
          const regenerationResult = await handleExpiredToken(token, request);
          if (regenerationResult) {
            return regenerationResult.response;
          }
        }
        
        // Log detailed error information for debugging
        console.log('-----------------------------');
        console.log('ORDERS API ERROR 401');
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
        
        // Return detailed error for debugging with new token option
        return NextResponse.json(
          { 
            error: 'Authentication error', 
            message: 'Token validation failed with the backend',
            debug: true,
            timestamp: new Date().toISOString(),
            tokenRegenerated: tokenExpired,
            needsLogin: true
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
          { error: 'Failed to fetch orders', message: errorText },
          { status: response.status }
        );
      }
    }
    
    // Parse and return the data
    const data = await response.json();
    console.log(`Successfully fetched ${data.length || 0} orders`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in orders API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        message: error.message,
        stack: DEBUG_MODE ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API Route] /api/orders: POST request received');
    
    // Get token from request
    const token = getTokenFromRequest(request);
    console.log(`Auth token exists: ${!!token}`);
    
    if (!token) {
      console.log('No auth token found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Debug token information and check if expired
    let tokenExpired = false;
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
            tokenExpired = true;
          }
        }
      }
    }
    
    // If token is already expired, regenerate it first
    if (tokenExpired) {
      console.log('[API Route] Token already expired, regenerating before making request');
      const regenerationResult = await handleExpiredToken(token, request);
      if (regenerationResult) {
        return regenerationResult.response;
      }
    }
    
    // Copy the request to get the body
    const requestBody = await request.json();
    
    // Get CSRF token from cookies or headers
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value || 
                      request.headers.get('X-CSRF-Token') ||
                      request.headers.get('X-XSRF-Token');
    
    console.log(`CSRF token exists: ${!!csrfToken}`);
    
    // URL for the backend API
    const apiURL = `${API_BASE_URL}/orders`;
    console.log(`Creating order via backend at: ${apiURL}`);
    
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
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Backend POST response status: ${response.status}`);
    
    // Handle non-successful responses
    if (!response.ok) {
      console.log(`Error response: ${response.status} ${response.statusText}`);
      
      // Special handling for 401 Unauthorized (like in GET)
      if (response.status === 401) {
        console.log('Received 401 Unauthorized from backend on POST');
        
        // Regenerate token on 401 error if not already tried
        if (!tokenExpired) {
          const regenerationResult = await handleExpiredToken(token, request);
          if (regenerationResult) {
            return regenerationResult.response;
          }
        }
        
        // Log detailed error information for debugging
        console.log('-----------------------------');
        console.log('ORDERS CREATE API ERROR 401');
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
            tokenRegenerated: tokenExpired,
            needsLogin: true
          },
          { status: 401 }
        );
      }
      
      // For other errors
      try {
        const errorData = await response.json();
        console.error('Error creating order:', errorData);
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      } catch (e) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        return NextResponse.json(
          { error: 'Failed to create order', message: errorText },
          { status: response.status }
        );
      }
    }
    
    // Parse and return the data
    const data = await response.json();
    console.log('Order created successfully, order number:', data.orderNumber);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in create order API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error.message,
        stack: DEBUG_MODE ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 