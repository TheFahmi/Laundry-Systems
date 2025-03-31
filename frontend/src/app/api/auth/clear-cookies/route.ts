import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('[API] Clear cookies request received');
  
  // Get CSRF token from request headers
  const csrfToken = req.headers.get('X-CSRF-Token') || 
                   req.headers.get('X-XSRF-Token') || 
                   req.headers.get('csrf-token');
                   
  console.log('[API] CSRF token present:', !!csrfToken);
  
  // Pass the request to the backend
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    // Try to clear cookies on the backend
    const backendResponse = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      },
      credentials: 'include'
    }).catch(err => {
      console.error('[API] Error calling backend logout:', err);
      return null;
    });
    
    // Even if backend request fails, continue with local cookie clearing
    if (backendResponse && !backendResponse.ok) {
      console.warn('[API] Backend logout returned non-OK status:', backendResponse.status);
    }
  } catch (error) {
    console.error('[API] Error clearing backend cookies:', error);
  }
  
  // Create response
  const response = NextResponse.json(
    { success: true, message: 'All cookies cleared' },
    { status: 200 }
  );
  
  // Clear all possible auth tokens
  response.cookies.delete('token');
  response.cookies.delete('js_token');
  response.cookies.delete('auth_token');
  response.cookies.delete('XSRF-TOKEN');
  response.cookies.delete('_csrf');
  
  console.log('[API] Cookies cleared');
  
  return response;
} 