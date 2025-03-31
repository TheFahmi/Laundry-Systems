import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

/**
 * Helper to get token from request
 */
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

/**
 * GET handler for checking authentication token
 */
export async function GET(req: NextRequest) {
  try {
    // Get all cookies for debugging
    const allCookies: Record<string, string> = {};
    req.cookies.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
    });
    
    // Get all headers for debugging
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    // Get token from request
    const token = getTokenFromRequest(req);
    
    // For security, only show first/last few characters
    const tokenDisplay = token ? 
      `${token.substring(0, 10)}...${token.substring(token.length - 5)}` : 
      null;
    
    return NextResponse.json({
      authenticated: !!token,
      tokenPresent: !!token,
      tokenSource: token ? 
        (req.headers.get('Authorization') ? 'header' : 'cookie') : 
        null,
      tokenSample: tokenDisplay,
      cookieCount: req.cookies.getAll().length,
      cookies: allCookies,
      headerCount: Object.keys(allHeaders).length,
      headers: allHeaders
    });
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json(
      { error: 'Failed to check token' },
      { status: 500 }
    );
  }
} 