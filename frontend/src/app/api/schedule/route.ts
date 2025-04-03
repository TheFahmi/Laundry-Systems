import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
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
    
    // Get request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.pickupDate || !body.pickupTimeSlot || !body.deliveryDate || !body.deliveryTimeSlot || !body.addressId) {
      return NextResponse.json({ 
        error: 'Invalid request',
        statusCode: 400,
        message: 'Tanggal pengambilan, waktu pengambilan, tanggal pengiriman, waktu pengiriman, dan alamat wajib diisi'
      }, { status: 400 });
    }
    
    console.log(`[API Route] POST /api/schedule: Creating new schedule`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] POST /api/schedule: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Failed to create schedule',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Failed to create schedule'
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] POST /api/schedule: Response received from backend');
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] POST /api/schedule: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 