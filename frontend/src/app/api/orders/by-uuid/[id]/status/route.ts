import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('[API Route] Direct UUID status update using backend URL:', API_BASE_URL);

// Helper to get token from request
function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from cookie
  const token = req.cookies.get('token')?.value;
  return token || null;
}

// Helper to get CSRF token from request
function getCsrfToken(req: NextRequest): string | null {
  return req.cookies.get('XSRF-TOKEN')?.value || 
         req.headers.get('x-csrf-token') || 
         null;
}

// Handle PATCH request for updating order status directly by UUID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    console.log(`[API by-uuid] Updating status for order ID: ${orderId}`);
    
    // Get token and CSRF token
    const token = getTokenFromRequest(req);
    const csrfToken = getCsrfToken(req);
    
    console.log(`[API by-uuid] Auth token exists: ${!!token}`);
    console.log(`[API by-uuid] CSRF token exists: ${!!csrfToken}`);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await req.json();
    console.log(`[API by-uuid] Request body:`, body);
    
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Direct status update with the UUID
    const updateUrl = `${API_BASE_URL}/orders/${orderId}/status`;
    console.log(`[API by-uuid] Sending status update to: ${updateUrl}`);
    console.log(`[API by-uuid] Status update payload:`, { status: body.status });
    console.log(`[API by-uuid] Using auth token (first 10 chars): ${token.substring(0, 10)}...`);
    
    try {
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ status: body.status })
      };
      
      console.log(`[API by-uuid] Request headers:`, requestOptions.headers);
      console.log(`[API by-uuid] Request body:`, requestOptions.body);
      
      const response = await fetch(updateUrl, requestOptions);
      
      console.log(`[API by-uuid] Status update response status:`, response.status);
      
      const responseText = await response.text();
      console.log(`[API by-uuid] Status update raw response:`, responseText);
      
      if (!response.ok) {
        console.error(`[API by-uuid] Error updating status:`, responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          return NextResponse.json(
            { error: 'Failed to update status', details: errorData },
            { status: response.status }
          );
        } catch (e) {
          return NextResponse.json(
            { error: 'Failed to update status', message: responseText },
            { status: response.status }
          );
        }
      }
      
      // Parse the response as JSON if it's not empty
      let data;
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error(`[API by-uuid] Error parsing response as JSON:`, e);
          data = { message: responseText };
        }
      } else {
        data = { message: "Status updated successfully" };
      }
      
      console.log(`[API by-uuid] Status updated successfully:`, data);
      
      return NextResponse.json({
        statusCode: 200,
        message: 'Order status updated successfully',
        data
      });
    } catch (error) {
      console.error('[API by-uuid] Network error in status update:', error);
      return NextResponse.json(
        { error: 'Network error updating status', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API by-uuid] Error in status update:', error);
    return NextResponse.json(
      { error: 'Failed to update status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 