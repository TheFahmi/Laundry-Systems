import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Helper function to create CORS headers with no-cache directives
function getCorsHeaders() {
  const headers = new Headers();
  // CORS headers
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  
  // No-cache headers
  headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');
  headers.append('Surrogate-Control', 'no-store');
  
  return headers;
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/users/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { 
        status: response.status,
        headers: getCorsHeaders()
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API Route] PATCH request to /api/users/${params.id}`);
    
    // Get token from cookies or Authorization header
    const token = getTokenFromRequest(request);
    
    if (!token) {
      console.log(`[API Route] No token available for user ${params.id}`);
      return NextResponse.json(
        { message: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }
    
    // Log the headers for debugging
    console.log('[API Route] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Get body data
    const body = await request.json();
    console.log('[API Route] Request body:', body);
    
    // Make sure role is uppercase if provided
    if (body.role && typeof body.role === 'string') {
      body.role = body.role.toUpperCase();
    }
    
    // Get CORS headers
    const headers = getCorsHeaders();
    
    const response = await fetch(`${API_URL}/users/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log(`[API Route] Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API Route] Error from backend:', errorData);
      
      return NextResponse.json(errorData, { 
        status: response.status,
        headers
      });
    }
    
    const data = await response.json();
    console.log('[API Route] Success response from backend');
    
    return NextResponse.json(data, { 
      status: 200,
      headers 
    });
  } catch (error) {
    console.error(`[API Route] Error updating user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/users/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 