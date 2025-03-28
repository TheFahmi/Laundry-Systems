import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/_next',
  '/favicon.ico',
];

// This middleware function will help us handle authentication and redirect malformed URLs
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Log all requests for debugging
  console.log(`[Middleware] Request path: ${path}`);

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath) || path === '/'
  );

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Redirect to login if no token and accessing protected route
  if (!token && !isPublicPath) {
    url.pathname = '/login';
    // Store the original URL to redirect back after login
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }

  // Allow access to public routes even without token
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for potentially malformed paths like /orders/undefined/customers
  if (path.includes('/undefined/') || path.includes('undefined')) {
    console.error(`[Middleware] Malformed URL detected: ${path}`);
    
    // Clean up the path by replacing undefined with appropriate values or redirecting
    if (path.includes('/orders/undefined')) {
      url.pathname = '/orders';
      return NextResponse.redirect(url);
    }
    
    if (path.includes('/customers/undefined')) {
      url.pathname = '/customers';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Run middleware on all routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|public|favicon.ico).*)',
  ],
}; 