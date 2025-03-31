import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('[API Route] Using backend URL:', API_BASE_URL);

export async function GET(request: NextRequest) {
  console.log('[API Route] /api/payments: GET request received');
  
  // Get token from cookies (if available)
  const token = request.cookies.get('token')?.value;
  console.log('[API Route] Token available:', !!token);
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  console.log('[API Route] CSRF token available:', !!csrfToken);
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    const search = searchParams.get('search') || '';
    const order_id = searchParams.get('order_id') || '';
    
    console.log('[API Route] Raw query params from request:', Object.fromEntries(searchParams.entries()));
    console.log('[API Route] Processed query params:', { page, limit, status, method, search, order_id });
    
    // Construct API URL with query parameters
    let url = `${API_BASE_URL}/payments?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (method) url += `&method=${method}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (order_id) url += `&order_id=${encodeURIComponent(order_id)}`;
    
    console.log('[API Route] Full backend request URL:', url);
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`[API Route] Backend error (${response.status}):`, await response.text());
      throw new Error(`Backend error: ${response.status}`);
    }
    
    // Parse response data
    const data = await response.json();
    console.log('[API Route] /api/payments: Data received:', data.total, 'payments');
    
    // Transform field names to camelCase for frontend
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map((payment: any) => {
        const transformed = {...payment};
        
        // Handle payment method
        if (payment.payment_method) {
          transformed.paymentMethod = payment.payment_method;
          delete transformed.payment_method;
        } else if (payment.method) {
          transformed.paymentMethod = payment.method;
          delete transformed.method;
        }
        
        // Handle payment status
        if (payment.payment_status) {
          transformed.status = payment.payment_status;
          delete transformed.payment_status;
        } else if (payment.status) {
          transformed.status = payment.status;
        }
        
        // Handle other snake_case fields
        if (payment.order_id) {
          transformed.orderId = payment.order_id;
          delete transformed.order_id;
        }
        
        if (payment.customer_id) {
          transformed.customerId = payment.customer_id;
          delete transformed.customer_id;
        }
        
        if (payment.created_at) {
          transformed.createdAt = payment.created_at;
          delete transformed.created_at;
        }
        
        if (payment.updated_at) {
          transformed.updatedAt = payment.updated_at;
          delete transformed.updated_at;
        }
        
        if (payment.reference_number) {
          transformed.referenceNumber = payment.reference_number;
          delete transformed.reference_number;
        }
        
        if (payment.transaction_id) {
          transformed.transactionId = payment.transaction_id;
          delete transformed.transaction_id;
        }
        
        return transformed;
      });
    }
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error in /api/payments:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengambil data pembayaran' },
      { status: 500 }
    );
  }
}

// POST handler for /api/payments
export async function POST(request: NextRequest) {
  console.log('[API Route] /api/payments: POST request received');
  
  // Get token from cookies (if available)
  const token = request.cookies.get('token')?.value;
  
  // Get CSRF token from cookies or headers
  const csrfToken = 
    request.cookies.get('_csrf')?.value || 
    request.cookies.get('XSRF-TOKEN')?.value ||
    request.headers.get('x-csrf-token');
  
  try {
    // Get request body
    const body = await request.json();
    
    // Transform field names to match backend schema
    const backendBody: any = {...body};
    
    // Handle camelCase to snake_case conversion for all fields
    if (body.paymentMethod !== undefined) {
      backendBody.method = body.paymentMethod;
      delete backendBody.paymentMethod;
    }
    
    if (body.paymentStatus !== undefined) {
      backendBody.status = body.paymentStatus;
      delete backendBody.paymentStatus;
    } else if (body.status !== undefined) {
      // If status is already provided, keep it
    }
    
    if (body.orderId !== undefined) {
      backendBody.order_id = body.orderId;
      delete backendBody.orderId;
    }
    
    if (body.customerId !== undefined) {
      backendBody.customer_id = body.customerId;
      delete backendBody.customerId;
    }
    
    if (body.transactionId !== undefined) {
      backendBody.transaction_id = body.transactionId;
      delete backendBody.transactionId;
    }
    
    if (body.referenceNumber !== undefined) {
      backendBody.reference_number = body.referenceNumber;
      delete backendBody.referenceNumber;
    }
    
    console.log('[API Route] Transformed payment data:', backendBody);
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(backendBody),
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Backend error (${response.status}):`, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json(
          { success: false, message: `Backend error: ${response.status}` },
          { status: response.status }
        );
      }
    }
    
    // Return backend response data
    const data = await response.json();
    
    // Transform response back to camelCase
    const transformedData = {...data};
    
    if (data.method) {
      transformedData.paymentMethod = data.method;
      delete transformedData.method;
    }
    
    if (data.status) {
      transformedData.paymentStatus = data.status;
    }
    
    // Handle other snake_case fields in response
    if (data.order_id) {
      transformedData.orderId = data.order_id;
      delete transformedData.order_id;
    }
    
    if (data.customer_id) {
      transformedData.customerId = data.customer_id;
      delete transformedData.customer_id;
    }
    
    if (data.created_at) {
      transformedData.createdAt = data.created_at;
      delete transformedData.created_at;
    }
    
    if (data.updated_at) {
      transformedData.updatedAt = data.updated_at;
      delete transformedData.updated_at;
    }
    
    if (data.reference_number) {
      transformedData.referenceNumber = data.reference_number;
      delete transformedData.reference_number;
    }
    
    if (data.transaction_id) {
      transformedData.transactionId = data.transaction_id;
      delete transformedData.transaction_id;
    }
    
    console.log('[API Route] Payment created successfully');
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('[API Route] Error creating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat membuat pembayaran' },
      { status: 500 }
    );
  }
} 