import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Mock data for testing
const mockPayments = [
  {
    id: "pay-001",
    orderId: "ord-001",
    orderNumber: "ORD-20250401-00001",
    amount: 75000,
    paymentMethod: "cash",
    status: "completed",
    transactionId: null,
    notes: "Pembayaran di toko",
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-01T10:30:00Z"
  },
  {
    id: "pay-002",
    orderId: "ord-002",
    orderNumber: "ORD-20250330-00002",
    amount: 45000,
    paymentMethod: "bank_transfer",
    status: "pending",
    transactionId: "TRX-12345",
    notes: "Menunggu konfirmasi",
    createdAt: "2025-03-30T14:15:00Z",
    updatedAt: "2025-03-30T14:15:00Z"
  },
  {
    id: "pay-003",
    orderId: "ord-003",
    orderNumber: "ORD-20250325-00003",
    amount: 120000,
    paymentMethod: "credit_card",
    status: "paid",
    transactionId: "CC-67890",
    notes: null,
    createdAt: "2025-03-25T09:45:00Z",
    updatedAt: "2025-03-25T09:45:00Z"
  },
  {
    id: "pay-004",
    orderId: "ord-004",
    orderNumber: "ORD-20250320-00004",
    amount: 35000,
    paymentMethod: "cash",
    status: "refunded",
    transactionId: null,
    notes: "Pembayaran dikembalikan",
    createdAt: "2025-03-20T11:20:00Z",
    updatedAt: "2025-03-21T15:30:00Z"
  },
  {
    id: "pay-005",
    orderId: "ord-005",
    orderNumber: "ORD-20250315-00005",
    amount: 95000,
    paymentMethod: "bank_transfer",
    status: "paid",
    transactionId: "TRX-54321",
    notes: null,
    createdAt: "2025-03-15T16:40:00Z",
    updatedAt: "2025-03-15T16:40:00Z"
  }
];

/**
 * GET handler for customer payments
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL search params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    
    // Construct the query parameters for the backend API
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (status) queryParams.append('status', status);
    if (method) queryParams.append('method', method);
    
    // Get authentication token from cookies or Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is authenticated
    if (!token) {
      console.log('[api/customer/payments] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to make request to backend API
    try {
      const response = await fetch(`${API_BASE_URL}/customers/payments?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      // If backend responds successfully, use that data
      if (response.ok) {
        const data = await response.json();
        console.log(`[api/customer/payments] Successfully fetched payments from backend`);
        return NextResponse.json(data);
      }
      
      // If unauthorized from backend, return that
      if (response.status === 401) {
        console.log('[api/customer/payments] Unauthorized from backend');
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // For 404 or other errors, fall through to mock data
      console.log(`[api/customer/payments] Backend API error (${response.status}), using mock data`);
    } catch (error) {
      console.log('[api/customer/payments] Error connecting to backend, using mock data:', error);
    }
    
    // Use mock data as fallback
    console.log('[api/customer/payments] Using mock payment data');
    
    // Filter mock data based on status and method if provided
    let filteredPayments = [...mockPayments];
    
    if (status) {
      const statusList = status.split(',');
      filteredPayments = filteredPayments.filter(payment => 
        statusList.includes(payment.status.toLowerCase())
      );
    }
    
    if (method) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.paymentMethod.toLowerCase() === method.toLowerCase()
      );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
    
    // Construct response in the expected format
    const mockResponse = {
      items: paginatedPayments,
      total: filteredPayments.length,
      page: page,
      limit: limit
    };
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('[api/customer/payments] Error in GET handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new payment
 */
export async function POST(request: NextRequest) {
  try {
    // Get authentication token from cookies or Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is authenticated
    if (!token) {
      console.log('[api/customer/payments] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log(`[api/customer/payments] Creating payment for order: ${body.orderId}`);

    try {
      // Try to make request to backend API
      const response = await fetch(`${API_BASE_URL}/customers/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      // If backend responds successfully, use that data
      if (response.ok) {
        const data = await response.json();
        console.log(`[api/customer/payments] Successfully created payment in backend`);
        return NextResponse.json(data);
      }
      
      // If unauthorized from backend, return that
      if (response.status === 401) {
        console.log('[api/customer/payments] Unauthorized from backend');
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // For other errors, check if we need to provide a specific error message
      if (response.status === 400) {
        const errorData = await response.json();
        console.log('[api/customer/payments] Bad request from backend');
        return NextResponse.json(
          { message: errorData.message || 'Invalid payment data' },
          { status: 400 }
        );
      }
      
      // For other backend errors, fall through to mock
      console.log(`[api/customer/payments] Backend API error (${response.status}), using mock response`);
    } catch (error) {
      console.log('[api/customer/payments] Error connecting to backend, using mock response:', error);
    }
    
    // Use mock response as fallback
    console.log('[api/customer/payments] Creating mock payment');
    
    // Create a mock payment with proper id etc.
    const mockPayment = {
      id: `pay-${Date.now().toString().substring(7)}`,
      orderId: body.orderId,
      orderNumber: body.orderNumber || `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${body.orderId}`,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      status: 'pending', // Initial status
      transactionId: body.transactionId || null,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockPayment);
  } catch (error) {
    console.error('[api/customer/payments] Error in POST handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 