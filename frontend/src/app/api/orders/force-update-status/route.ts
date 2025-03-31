import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzMyY2Y3NS1mNzYxLTQ4MTUtOTFiNC02MTlkMWNhOGViNWEiLCJ1c2VybmFtZSI6ImZhaG1pIiwicm9sZSI6InN0YWZmIiwiaWF0IjoxNzQzMzQzNDY0LCJleHAiOjE3NDM0Mjk4NjR9.lpFBwyGZOapYEdAhtHVV6Io5Q4JYHsg3_Lsmn6Qvh6Q';

export async function POST(request: NextRequest) {
  try {
    console.log(`[force-update-status] POST request received at ${new Date().toISOString()}`);
    console.log(`[force-update-status] API_BASE_URL: ${API_BASE_URL}`);
    
    // Parse the request body
    const body = await request.json();
    const { id, status } = body;

    console.log(`[force-update-status] Request body:`, body);
    console.log(`[force-update-status] Attempting to update order ${id} to status: ${status}`);

    if (!id) {
      console.log(`[force-update-status] Error: Order ID is required`);
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      console.log(`[force-update-status] Error: Status is required`);
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log(`[force-update-status] Error: Invalid UUID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid UUID format for order ID' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['new', 'processing', 'washing', 'drying', 'folding', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.log(`[force-update-status] Error: Invalid status: ${status}`);
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const endpoint = `${API_BASE_URL}/orders/${id}/status`;
    console.log(`[force-update-status] Making API call to ${endpoint}`);

    // Make direct API call to backend
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ status })
      });

      // Get response text
      const responseText = await response.text();
      console.log(`[force-update-status] Backend response status: ${response.status}`);
      console.log(`[force-update-status] Backend response body: ${responseText}`);

      if (!response.ok) {
        console.log(`[force-update-status] Backend request failed with status ${response.status}`);
        return NextResponse.json(
          { 
            error: 'Backend API call failed', 
            status: response.status,
            statusText: response.statusText,
            responseBody: responseText
          },
          { status: response.status }
        );
      }

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log(`[force-update-status] Successfully parsed response as JSON:`, responseData);
      } catch (e) {
        console.error('[force-update-status] Failed to parse response as JSON:', e);
        responseData = { rawResponse: responseText };
      }

      console.log(`[force-update-status] Status update successful`);
      return NextResponse.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: responseData
      });
    } catch (fetchError: any) {
      console.error(`[force-update-status] Fetch error:`, fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to connect to backend API',
          details: fetchError.message,
          endpoint
        },
        { status: 502 } // Bad Gateway
      );
    }
  } catch (error: any) {
    console.error('[force-update-status] Unhandled error:', error);
    console.error('[force-update-status] Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to update order status',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 