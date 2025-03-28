import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, parseAuthHeader } from './jwt';

/**
 * Middleware to check if a request has a valid JWT token
 * 
 * @param request The incoming request
 * @returns The response or null if authentication is successful
 */
export function authMiddleware(request: NextRequest): NextResponse | null {
  // Get the Authorization header
  const authHeader = request.headers.get('Authorization');
  
  // Parse the token from the header
  const token = parseAuthHeader(authHeader || '');
  
  // If no token is provided, return 401 Unauthorized
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Verify the token
  const payload = verifyToken(token);
  
  // If token verification fails, return 401 Unauthorized
  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
  
  // Authentication successful, return null to continue
  return null;
}

/**
 * Middleware to check if a user has the required role
 * 
 * @param request The incoming request
 * @param allowedRoles Array of allowed roles
 * @returns The response or null if authorization is successful
 */
export function roleMiddleware(
  request: NextRequest, 
  allowedRoles: string[]
): NextResponse | null {
  // First check authentication
  const authResult = authMiddleware(request);
  if (authResult) {
    return authResult;
  }
  
  // Get the Authorization header and parse token
  const authHeader = request.headers.get('Authorization');
  const token = parseAuthHeader(authHeader || '');
  
  // This should never happen since authMiddleware already checked
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Verify the token and get payload
  const payload = verifyToken(token);
  
  // This should never happen since authMiddleware already checked
  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
  
  // Check if user has the required role
  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Authorization successful, return null to continue
  return null;
} 