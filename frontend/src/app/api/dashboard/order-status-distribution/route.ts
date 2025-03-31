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
  console.log('[API Route] /api/dashboard/order-status-distribution: GET request received');
  
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
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  
  console.log('[API Route] Query params:', { startDate, endDate });
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    console.log('[API Route] Fetching order status distribution data from backend');
    
    // Build proper authorization headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Build URL with query parameters
    let url = `${API_BASE_URL}/dashboard/order-status-distribution`;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Backend error (${response.status}):`, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to fetch order status distribution data',
        statusCode: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] Order status distribution data received:', data);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] Exception:', error.message);
    
    // Fallback to static data if there's an error
    console.log('[API Route] Using fallback static order status distribution data');
    const fallbackData = [
      { status: 'Selesai', jumlah: 98, persentase: 81.7 },
      { status: 'Dalam Proses', jumlah: 15, persentase: 12.5 },
      { status: 'Menunggu', jumlah: 7, persentase: 5.8 }
    ];
    
    return NextResponse.json(fallbackData);
  }
} 