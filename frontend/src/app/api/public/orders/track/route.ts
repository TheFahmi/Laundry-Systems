import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    // Extract order number from request body
    const body = await req.json();
    
    if (!body.orderNumber) {
      return NextResponse.json({ 
        error: 'Order number is required',
        statusCode: 400,
        message: 'Nomor pesanan wajib diisi'
      }, { status: 400 });
    }
    
    console.log(`[API Route] /api/public/orders/track: Tracking order ${body.orderNumber}`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/public/orders/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] /api/public/orders/track: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Order tracking failed',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Order tracking failed'
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] /api/public/orders/track: Response received from backend');
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] /api/public/orders/track: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 