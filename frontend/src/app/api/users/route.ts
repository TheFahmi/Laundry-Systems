import { NextRequest, NextResponse } from 'next/server';
import { withAuth, proxyToBackend } from '@/lib/auth';

/**
 * GET handler to get user list (protected by JWT)
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    // Check if user has admin permissions
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Forward request to backend
    return proxyToBackend(req, '/api/users');
  });
}

/**
 * POST handler to create a new user (protected by JWT and CSRF)
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    // Check if user has admin permissions
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Forward request to backend
    return proxyToBackend(req, '/api/users');
  });
} 