import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function will help us log and redirect malformed URLs
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Log all requests for debugging
  console.log(`[Middleware] Request path: ${path}`);

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

// Only run middleware on specific paths to avoid unnecessary processing
export const config = {
  matcher: [
    '/orders/:path*',
    '/customers/:path*',
    '/dashboard/:path*',
    '/payments/:path*',
  ],
}; 