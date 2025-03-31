import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Added comments to clarify middleware vs client usage
// This file should ONLY contain middleware and edge runtime compatible code
// Do NOT import from next/headers here

/**
 * Extract JWT token from request
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get from cookies
  const token = req.cookies.get('token')?.value;
  return token || null;
}

/**
 * Verify JWT token and return payload
 */
export async function verifyJwt(token: string): Promise<{ valid: boolean; payload: any | null }> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

/**
 * Middleware to protect API routes
 */
export function withAuth(
  req: NextRequest, 
  handler: (user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = getTokenFromRequest(req);
  
  // If no token, return unauthorized
  if (!token) {
    return Promise.resolve(
      NextResponse.json(
        { message: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    );
  }
  
  return verifyJwt(token).then(({ valid, payload }) => {
    // If invalid token, return unauthorized
    if (!valid || !payload) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    // Pass the user to the handler
    return handler(payload);
  });
}

/**
 * Client-side authenticated fetch wrapper
 * For use in client components and services
 */
export async function fetchWithAuth<T = any>(
  url: string, 
  options: RequestInit & { 
    returnRawResponse?: boolean;
  } = {}
): Promise<T> {
  // Start with default headers
  const headers = new Headers(options.headers);
  
  // Add Content-Type if not present and we have a body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Try to get token from cookie (client-side)
  let token: string | undefined;
  if (typeof document !== 'undefined') {
    // Extract token from document.cookie
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    token = match ? match[2] : undefined;
  }
  
  // Add Authorization header if we have a token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Ensure credentials are included
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };
  
  // Make the request
  const response = await fetch(url, fetchOptions);
  
  // Handle unauthorized response
  if (response.status === 401) {
    // Optional: Redirect to login page or show login modal
    if (typeof window !== 'undefined') {
      // Redirect to login
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  
  // Return raw response if requested
  if (options.returnRawResponse) {
    return response as unknown as T;
  }
  
  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data as T;
  } else {
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(text || 'Request failed');
    }
    
    return text as unknown as T;
  }
}

/**
 * Proxy API requests to backend
 */
export async function proxyToBackend(
  req: NextRequest, 
  endpoint: string,
  options: { skipAuth?: boolean } = {}
): Promise<NextResponse> {
  // Get the backend API URL
  const apiUrl = new URL(endpoint, API_BASE_URL);
  
  // Copy search parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });
  
  // Create headers for the backend request
  const headers = new Headers();
  
  // Copy relevant headers from request
  req.headers.forEach((value, key) => {
    // Skip hop-by-hop headers
    const hopByHopHeaders = [
      'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
      'te', 'trailer', 'transfer-encoding', 'upgrade', 'host'
    ];
    
    if (!hopByHopHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  
  // Add Authorization header for authenticated requests
  if (!options.skipAuth) {
    const token = getTokenFromRequest(req);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  // Forward the request to the backend
  try {
    const backendResponse = await fetch(apiUrl.toString(), {
      method: req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.blob(),
      redirect: 'manual',
      cache: 'no-store'
    });
    
    // Create the response headers
    const responseHeaders = new Headers();
    
    // Copy headers from backend response
    backendResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    
    // Add no-cache headers
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    responseHeaders.set('Surrogate-Control', 'no-store');
    
    // Create and return the response
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to proxy to backend', error: error.message },
      { status: 500 }
    );
  }
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    return payload;
  } catch (error) {
    return null;
  }
}

export async function handleAuthApi(
  req: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    // ... existing code ...
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 