import { NextRequest, NextResponse } from 'next/server';
import { withAuth, proxyToBackend } from '@/lib/auth';

/**
 * Protected route to get the current user's profile
 * Requires authentication and includes CSRF protection for non-GET methods
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    // No need for CSRF on GET requests
    // Just forward the user object from the JWT
    const response = NextResponse.json({
      id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  });
}

/**
 * Update the current user's profile
 * Requires authentication and CSRF validation
 */
export async function PUT(req: NextRequest) {
  return withAuth(req, async (user) => {
    // For PUT requests, we need to validate CSRF token, which happens in withAuth
    // Then proxy to the backend API
    return proxyToBackend(req, `/api/users/${user.userId}`);
  });
}

/**
 * Delete the current user's account
 * Requires authentication and CSRF validation
 */
export async function DELETE(req: NextRequest) {
  return withAuth(req, async (user) => {
    // For DELETE requests, we need to validate CSRF token
    // Then proxy to the backend API
    return proxyToBackend(req, `/api/users/${user.userId}`);
  });
} 