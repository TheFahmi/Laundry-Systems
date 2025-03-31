import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  console.log(`[API] Fix token request for username: ${username}`);
  
  // Skip CSRF and auth checks for this endpoint
  return proxyToBackend(req, `/auth/fix-token/${username}`, {
    skipCsrf: true,
    skipAuth: true
  });
} 