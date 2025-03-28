import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../auth/middleware';
import { verifyToken, parseAuthHeader } from '../auth/jwt';

export async function GET(request: NextRequest) {
  // Check if the user is authenticated
  const authResult = authMiddleware(request);
  if (authResult) {
    return authResult; // Return 401 if authentication failed
  }

  // Get user info from token
  const authHeader = request.headers.get('Authorization');
  const token = parseAuthHeader(authHeader || '');
  const payload = verifyToken(token!); // Non-null assertion is safe here because authMiddleware already checked

  return NextResponse.json({
    success: true,
    message: 'This is a protected route',
    user: {
      userId: payload?.userId,
      username: payload?.username,
      role: payload?.role
    }
  });
}

export async function POST(request: NextRequest) {
  // Check if the user is authenticated
  const authResult = authMiddleware(request);
  if (authResult) {
    return authResult; // Return 401 if authentication failed
  }

  // Process the request...
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: 'Data received in protected route',
    data: body
  });
} 