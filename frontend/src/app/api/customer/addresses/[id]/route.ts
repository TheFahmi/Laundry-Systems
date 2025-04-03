import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        error: 'Address ID is required',
        statusCode: 400,
        message: 'ID alamat wajib diisi'
      }, { status: 400 });
    }
    
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
    
    console.log(`[API Route] PUT /api/customer/addresses/${id}: Updating customer address`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/customers/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] PUT /api/customer/addresses/${id}: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Failed to update customer address',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Failed to update customer address'
        }, { status: response.status });
      }
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] PUT /api/customer/addresses/${id}: Response received from backend`);
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] PUT /api/customer/addresses/[id]: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        error: 'Address ID is required',
        statusCode: 400,
        message: 'ID alamat wajib diisi'
      }, { status: 400 });
    }
    
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
    
    console.log(`[API Route] DELETE /api/customer/addresses/${id}: Deleting customer address`);
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/customers/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Handle response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] DELETE /api/customer/addresses/${id}: Backend error (${response.status}):`, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorJson.message || 'Failed to delete customer address',
          details: errorJson
        }, { status: response.status });
      } catch (e) {
        // If parsing fails, return text error
        return NextResponse.json({ 
          error: 'Backend request failed',
          statusCode: response.status,
          message: errorText || 'Failed to delete customer address'
        }, { status: response.status });
      }
    }
    
    // For successful delete, we may get 204 No Content
    if (response.status === 204) {
      console.log(`[API Route] DELETE /api/customer/addresses/${id}: Successfully deleted address`);
      return NextResponse.json({ 
        statusCode: 204,
        message: 'Address deleted successfully',
        data: { id }
      });
    }
    
    // Parse response data
    const data = await response.json();
    console.log(`[API Route] DELETE /api/customer/addresses/${id}: Response received from backend`);
    
    // Return successful response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Route] DELETE /api/customer/addresses/[id]: Exception occurred:', error.message);
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 