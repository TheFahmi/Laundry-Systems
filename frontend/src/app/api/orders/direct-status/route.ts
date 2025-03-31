import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('[API Route] Direct status update using backend URL:', API_BASE_URL);

export async function POST(
  req: NextRequest
) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await req.json();
    console.log(`[Direct API] Request body:`, body);
    
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    // Direct status update with the UUID - use the known working endpoint format
    const updateUrl = `${API_BASE_URL}/orders/${body.id}/status`;
    console.log(`[Direct API] Sending status update to: ${updateUrl}`);
    console.log(`[Direct API] Status update payload:`, { status: body.status });
    console.log(`[Direct API] Using auth token (first 10 chars): ${token.substring(0, 10)}...`);
    
    const requestOptions = {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: body.status })
    };
    
    console.log(`[Direct API] Request headers:`, requestOptions.headers);
    console.log(`[Direct API] Request body:`, requestOptions.body);
    
    try {
      const response = await fetch(updateUrl, requestOptions);
      
      console.log(`[Direct API] Status update response status:`, response.status);
      
      const responseText = await response.text();
      console.log(`[Direct API] Status update raw response:`, responseText);
      
      if (!response.ok) {
        console.error(`[Direct API] Error updating status:`, responseText);
        
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
          console.error(`[Direct API] Error parsing response as JSON:`, e);
          data = { message: responseText };
        }
      } else {
        data = { message: "Status updated successfully" };
      }
      
      console.log(`[Direct API] Status updated successfully:`, data);
      
      return NextResponse.json({
        statusCode: 200,
        message: 'Order status updated successfully',
        data
      });
    } catch (error) {
      console.error('[Direct API] Network error in status update:', error);
      return NextResponse.json(
        { error: 'Network error updating status', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Direct API] Error in status update:', error);
    return NextResponse.json(
      { error: 'Failed to update status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 