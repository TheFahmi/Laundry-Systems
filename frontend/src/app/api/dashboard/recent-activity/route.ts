import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get token from request
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

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/dashboard/recent-activity: GET request received');
  
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 10;
  
  console.log('[API Route] Query params:', { limit });
  
  // For testing, just return fallback data
  const fallbackData = [
    { id: 1, type: "order", text: "New order #12345 was created", time: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: 2, type: "payment", text: "Payment of Rp500,000 received for order #12340", time: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: 3, type: "customer", text: "New customer Budi Santoso registered", time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 4, type: "service", text: "Service 'Express Laundry' updated", time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 5, type: "order", text: "Order #12339 marked as completed", time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  ].slice(0, limit);
  
  console.log('[API Route] Returning fallback data:', fallbackData);
  return NextResponse.json(fallbackData);
} 