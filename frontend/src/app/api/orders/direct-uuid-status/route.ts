import { NextRequest, NextResponse } from 'next/server';

/**
 * POST handler for directly updating order status using UUID
 * This eliminates the need to first fetch the order by number
 */
export async function POST(req: NextRequest) {
  console.log('[API] Direct UUID status update received');
  
  try {
    // Get API URL from environment variable with fallback
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('[API] Using backend URL:', API_URL);
    
    // Get token from cookies - try both types
    const token = req.cookies.get('token')?.value || req.cookies.get('js_token')?.value;
    
    if (!token) {
      console.log('[API] No authentication token found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('[API] Auth token found (first 10 chars):', token.substring(0, 10) + '...');
    
    // Extract request data
    const requestData = await req.json();
    console.log('[API] Request data:', requestData);
    
    // Validate request data
    if (!requestData.uuid || !requestData.status) {
      console.log('[API] Missing required fields in request');
      return NextResponse.json(
        { error: 'Order UUID and status are required' },
        { status: 400 }
      );
    }
    
    const orderId = requestData.uuid;
    const status = requestData.status;
    
    // IMPORTANT FIX: Use the correct path - /orders/{id}/status
    // This is the endpoint that exists in the backend
    const updateUrl = `${API_URL}/orders/${orderId}/status`;
    console.log(`[API] Sending status update to: ${updateUrl}`);
    
    try {
      // Make the request to update status
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH', // Use PATCH method which is expected by the backend
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      console.log(`[API] Status update response status:`, updateResponse.status);
      
      // Get the response text
      const responseText = await updateResponse.text();
      console.log(`[API] Raw response from backend:`, responseText);
      
      // Handle error response
      if (!updateResponse.ok) {
        console.error(`[API] Error updating status:`, responseText);
        
        let errorMessage = 'Failed to update status';
        let errorDetails = { message: responseText };
        
        try {
          errorDetails = JSON.parse(responseText);
        } catch (e) {
          // If can't parse as JSON, use as is
        }
        
        return NextResponse.json(
          { error: errorMessage, details: errorDetails },
          { status: updateResponse.status }
        );
      }
      
      // Parse successful response
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : { message: 'Status updated successfully' };
      } catch (e) {
        responseData = { message: responseText || 'Status updated successfully' };
      }
      
      console.log(`[API] Status update successful:`, responseData);
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Order status updated successfully',
        data: responseData
      });
    } catch (error) {
      console.error('[API] Network error updating status:', error);
      return NextResponse.json(
        { error: 'Network error', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Error processing request:', error);
    return NextResponse.json(
      { error: 'Server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 