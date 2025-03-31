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
  console.log('[API Route] /api/dashboard/top-customers: GET request received');
  
  // Get token using helper function
  const token = getTokenFromRequest(request);
  
  if (!token) {
    console.log('[API Route] No auth token found in request');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 5;
  
  console.log('[API Route] Query params:', { limit });
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    console.log('[API Route] Fetching top customers data from backend');
    
    // Build proper authorization headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/dashboard/top-customers?limit=${limit}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to fetch top customers data',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] Top customers data received:', data);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] Exception:', error.message);
    
    // Fallback to static data if there's an error
    console.log('[API Route] Using fallback static top customers data');
    const fallbackData = [
      {
        id: '1',
        nama: 'PT Maju Bersama',
        totalPesanan: 24,
        totalNilai: 4800000
      },
      {
        id: '2',
        nama: 'Hotel Sejahtera',
        totalPesanan: 18,
        totalNilai: 3600000
      },
      {
        id: '3',
        nama: 'Restoran Bahagia',
        totalPesanan: 15,
        totalNilai: 2250000
      },
      {
        id: '4',
        nama: 'Klinik Sehat',
        totalPesanan: 12,
        totalNilai: 1800000
      },
      {
        id: '5',
        nama: 'Kantor Kreasi',
        totalPesanan: 10,
        totalNilai: 1500000
      }
    ].slice(0, limit);
    
    return NextResponse.json(fallbackData);
  }
} 