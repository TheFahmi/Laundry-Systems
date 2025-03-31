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
  console.log('[API Route] /api/dashboard/summary: GET request received');
  
  // For testing, just return fallback data
  console.log('[API Route] Using fallback static summary data');
  const summaryData = {
    totalPendapatan: 15000000,
    totalPesanan: 120,
    pesananSelesai: 98,
    pelangganAktif: 45
  };
  
  // Format respons agar sesuai dengan respons backend
  const responseData = {
    statusCode: 200,
    message: 'Success',
    timestamp: new Date().toISOString(),
    data: summaryData
  };
  
  console.log('[API Route] Returning fallback data:', responseData);
  return NextResponse.json(responseData);
} 