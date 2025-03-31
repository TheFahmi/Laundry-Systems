import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API] Order detail request received for ID:', params.id);
  
  try {
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
    
    // Get API URL from environment variable with fallback
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Fetch order details from backend using UUID
    const orderUrl = `${API_URL}/orders/${params.id}`;
    console.log(`[API] Fetching order details from: ${orderUrl}`);
    
    const orderResponse = await fetch(orderUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    console.log(`[API] Order fetch response status:`, orderResponse.status);
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error(`[API] Error fetching order details:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: 'Failed to fetch order details', details: errorData },
          { status: orderResponse.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: 'Failed to fetch order details', message: errorText },
          { status: orderResponse.status }
        );
      }
    }
    
    // Parse response data
    const responseText = await orderResponse.text();
    let orderData;
    
    try {
      orderData = JSON.parse(responseText);
      console.log(`[API] Order data fetched successfully`);
    } catch (e) {
      console.error(`[API] Error parsing order data as JSON:`, e);
      return NextResponse.json(
        { error: 'Failed to parse order data', message: responseText },
        { status: 500 }
      );
    }
    
    // Return the order data
    return NextResponse.json(orderData);
  } catch (error) {
    console.error('[API] Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 