import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/auth';

/**
 * POST handler for registration requests
 */
export async function POST(req: NextRequest) {
  // Skip auth for registration endpoint
  return proxyToBackend(req, '/auth/register', {
    skipAuth: true
  });
} 