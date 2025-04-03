import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require authentication
const AUTH_PATHS = ['/dashboard', '/orders', '/customers', '/services', '/reports', '/settings'];
// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password'];
// Public API paths that don't require authentication
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/register'];

// Admin paths that require admin role
const ADMIN_PATHS = ['/admin', '/admin/dashboard', '/admin/users', '/admin/settings'];

// Customer paths 
const CUSTOMER_PATHS = ['/customer', '/customer/dashboard', '/customer/orders', '/customer/profile'];

// Roles that are allowed to access admin paths
const ADMIN_ROLES = ['admin', 'staff', 'manager', 'operator', 'cashier'];

// Secret key for JWT verification - should match the one in auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';

// The list of API paths that should bypass the proxy logic
const BYPASS_PATHS: string[] = [
  // Add any API routes that should not be proxied
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For admin paths, check if user has admin role
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify and decode the token
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      // Check if user has admin role
      if (!payload.role || !ADMIN_ROLES.includes(payload.role as string)) {
        // Check if user is a customer
        if (payload.role === 'customer') {
          // User is a customer, redirect directly to customer dashboard
          return NextResponse.redirect(new URL('/customer/dashboard', request.url));
        } else {
          // User has another non-admin role, redirect to access denied page
          return NextResponse.redirect(new URL('/access-denied', request.url));
        }
      }
    } catch (error) {
      // Token is invalid, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Only apply API proxy middleware to API routes
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
    // Return server error
    return NextResponse.json(
      { message: 'API proxy error' },
      { status: 500 }
    );
  }
}

// Configure the middleware to run for both API routes and admin routes
export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
}; 