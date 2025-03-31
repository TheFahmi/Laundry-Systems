import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require authentication
const AUTH_PATHS = ['/dashboard', '/orders', '/customers', '/services', '/reports', '/settings'];
// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password'];
// Public API paths that don't require authentication
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/register'];

// Secret key for JWT verification - should match the one in auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';

// The list of API paths that should bypass the proxy logic
const BYPASS_PATHS: string[] = [
  // Add any API routes that should not be proxied
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply this middleware to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip specific paths that should be handled by their own route handlers
  if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get the backend API URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    // Construct target URL for the backend API
    // Remove '/api' prefix when forwarding to backend
    const targetPath = pathname.replace(/^\/api/, '');
    const url = new URL(targetPath, backendUrl);
    
    // Copy all search parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    
    // Clone the request headers
    const headers = new Headers(request.headers);
    
    // Get authorization token from cookies or Authorization header
    const authHeader = request.headers.get('Authorization');
    const tokenCookie = request.cookies.get('token');
    
    // Set Authorization header if available from either source
    if (authHeader) {
      headers.set('Authorization', authHeader);
    } else if (tokenCookie) {
      headers.set('Authorization', `Bearer ${tokenCookie.value}`);
    }
    
    // Forward the request to the backend
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });
    
    // Create a NextResponse from the backend response
    const responseHeaders = new Headers(response.headers);
    
    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Create the response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}

// Configure the middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
}; 