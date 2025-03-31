import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('[API Route] Using backend URL:', API_BASE_URL);

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

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  console.log(`[API Route] /api/payments/order/${params.orderId}: GET request received`);
  
  // Get token using the helper function
  const token = getTokenFromRequest(request);
  
  if (!token) {
    console.log('[API Route] No auth token found in request');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    // Build URL with order_id filter
    const url = `${API_BASE_URL}/payments?order_id=${encodeURIComponent(params.orderId)}&page=1&limit=50`;
    console.log(`[API Route] Fetching payments for order from: ${url}`);
    
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
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`[API Route] Backend error (${response.status}):`, await response.text());
      throw new Error(`Backend error: ${response.status}`);
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] Found ${data.total || 0} payments for order ${params.orderId}`);
    
    // Make sure we standardize the data format
    let paymentsData = data;
    
    // Format the response data properly
    if (data.data) {
      if (Array.isArray(data.data)) {
        paymentsData = { items: data.data, total: data.data.length };
      } else if (data.data.data && Array.isArray(data.data.data)) {
        paymentsData = { items: data.data.data, total: data.data.data.length };
      } else {
        paymentsData = { items: [data.data], total: 1 };
      }
    } else if (data.items && Array.isArray(data.items)) {
      paymentsData = data; // Already in expected format
    } else if (Array.isArray(data)) {
      paymentsData = { items: data, total: data.length };
    }
    
    console.log(`[API Route] Returning normalized payment data:`, paymentsData);
    
    // Return the data
    return NextResponse.json(paymentsData);
  } catch (error) {
    console.error(`[API Route] Error fetching payments for order:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments for this order' },
      { status: 500 }
    );
  }
} 