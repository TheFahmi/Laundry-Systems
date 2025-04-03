import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies or authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required',
        statusCode: 401,
        message: 'Anda harus login terlebih dahulu'
      }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    
    // Construct query string
    let queryString = `page=${page}&limit=${limit}`;
    if (status) {
      queryString += `&status=${status}`;
    }
    
    console.log(`[API Route] GET /api/orders: Fetching orders with params: ${queryString}`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/orders?${queryString}`, {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    // Handle response status
    if (!response.ok) {
        const errorText = await response.text();
      console.error(`[API Route] GET /api/orders: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Failed to fetch orders',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Failed to fetch orders'
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] GET /api/orders: Response received from backend');
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] GET /api/orders: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 