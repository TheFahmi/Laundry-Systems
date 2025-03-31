import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/auth';

/**
 * POST handler for logout requests
 */
export async function POST(req: NextRequest) {
  console.log('[API] Logout request received');
  
  // Skip CSRF check for logout endpoint
  const backendResponse = await proxyToBackend(req, '/api/auth/logout', {
    skipCsrf: true  // Add this to skip CSRF validation
  });
  
  // Clear auth cookie on logout
  const response = NextResponse.json(
    backendResponse.body, 
    { status: backendResponse.status }
  );
  
  // Ensure cookies are cleared
  response.cookies.delete('token');
  response.cookies.delete('auth_token');
  
  return response;
} 