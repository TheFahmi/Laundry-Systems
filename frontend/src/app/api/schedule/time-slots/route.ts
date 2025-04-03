import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ 
        error: 'Date is required',
        statusCode: 400,
        message: 'Tanggal wajib diisi'
      }, { status: 400 });
    }
    
    // Get token from cookies or authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  req.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log(`[API Route] GET /api/schedule/time-slots: Fetching time slots for date: ${date}`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/schedule/time-slots?date=${date}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] GET /api/schedule/time-slots: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Failed to fetch time slots',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Failed to fetch time slots'
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] GET /api/schedule/time-slots: Response received from backend');
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] GET /api/schedule/time-slots: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 