import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, proxyToBackend } from '@/lib/auth';

/**
 * POST handler to refresh JWT token
 * Requires a valid but may be expired JWT token
 */
export async function POST(req: NextRequest) {
  // Get token from request
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { message: 'No token provided' }, 
      { status: 401 }
    );
  }
  
  // Proxy the request to backend with the token in authorization header
  // We're not using withAuth middleware here because the token might be expired
  // but still valid for refresh
  return proxyToBackend(req, '/auth/refresh', {
    skipAuth: false, // We'll manually add the token
    skipCsrf: true, // Refresh tokens should not require CSRF
  });
} 