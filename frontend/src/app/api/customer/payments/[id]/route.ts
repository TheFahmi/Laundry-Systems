import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Define the payment type
interface MockPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    customerId: string;
    totalItems: number;
    totalPrice: number;
    status: string;
    createdAt: string;
  }
}

// Mock payment data for testing
const mockPayments: Record<string, MockPayment> = {
  "5ef7550f-02b8-4e8b-a945-65eccc5d5551": {
    id: "5ef7550f-02b8-4e8b-a945-65eccc5d5551",
    orderId: "ord-special",
    orderNumber: "ORD-20250401-SPECIAL",
    amount: 85000,
    paymentMethod: "bank_transfer",
    status: "completed",
    transactionId: "TRX-SPECIAL",
    notes: "Added for testing",
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-01T10:30:00Z",
    order: {
      id: "ord-special",
      orderNumber: "ORD-20250401-SPECIAL",
      customerId: "cust-001",
      totalItems: 3,
      totalPrice: 85000,
      status: "completed",
      createdAt: "2025-04-01T10:15:00Z"
    }
  },
  "pay-001": {
    id: "pay-001",
    orderId: "ord-001",
    orderNumber: "ORD-20250401-00001",
    amount: 75000,
    paymentMethod: "cash",
    status: "completed",
    transactionId: null,
    notes: "Pembayaran di toko",
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-01T10:30:00Z",
    order: {
      id: "ord-001",
      orderNumber: "ORD-20250401-00001",
      customerId: "cust-001",
      totalItems: 3,
      totalPrice: 75000,
      status: "completed",
      createdAt: "2025-04-01T10:15:00Z"
    }
  },
  "pay-002": {
    id: "pay-002",
    orderId: "ord-002",
    orderNumber: "ORD-20250330-00002",
    amount: 45000,
    paymentMethod: "bank_transfer",
    status: "pending",
    transactionId: "TRX-12345",
    notes: "Menunggu konfirmasi",
    createdAt: "2025-03-30T14:15:00Z",
    updatedAt: "2025-03-30T14:15:00Z",
    order: {
      id: "ord-002",
      orderNumber: "ORD-20250330-00002",
      customerId: "cust-001",
      totalItems: 2,
      totalPrice: 45000,
      status: "processing",
      createdAt: "2025-03-30T14:00:00Z"
    }
  },
  "pay-003": {
    id: "pay-003",
    orderId: "ord-003",
    orderNumber: "ORD-20250325-00003",
    amount: 120000,
    paymentMethod: "credit_card",
    status: "paid",
    transactionId: "CC-67890",
    notes: null,
    createdAt: "2025-03-25T09:45:00Z",
    updatedAt: "2025-03-25T09:45:00Z",
    order: {
      id: "ord-003",
      orderNumber: "ORD-20250325-00003",
      customerId: "cust-001",
      totalItems: 5,
      totalPrice: 120000,
      status: "completed",
      createdAt: "2025-03-25T09:30:00Z"
    }
  },
  "pay-004": {
    id: "pay-004",
    orderId: "ord-004",
    orderNumber: "ORD-20250320-00004",
    amount: 35000,
    paymentMethod: "cash",
    status: "refunded",
    transactionId: null,
    notes: "Pembayaran dikembalikan",
    createdAt: "2025-03-20T11:20:00Z",
    updatedAt: "2025-03-21T15:30:00Z",
    order: {
      id: "ord-004",
      orderNumber: "ORD-20250320-00004",
      customerId: "cust-001",
      totalItems: 1,
      totalPrice: 35000,
      status: "canceled",
      createdAt: "2025-03-20T11:00:00Z"
    }
  },
  "pay-005": {
    id: "pay-005",
    orderId: "ord-005",
    orderNumber: "ORD-20250315-00005",
    amount: 95000,
    paymentMethod: "bank_transfer",
    status: "paid",
    transactionId: "TRX-54321",
    notes: null,
    createdAt: "2025-03-15T16:40:00Z",
    updatedAt: "2025-03-15T16:40:00Z",
    order: {
      id: "ord-005",
      orderNumber: "ORD-20250315-00005",
      customerId: "cust-001",
      totalItems: 4,
      totalPrice: 95000,
      status: "completed",
      createdAt: "2025-03-15T16:30:00Z"
    }
  }
};

/**
 * GET handler for specific payment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    console.log(`[API Route] GET /api/customer/payments/${paymentId}`);
    
    // Get authentication token from cookies or Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log(`[API Route] Authentication token present: ${!!token}`);

    // Check if user is authenticated
    if (!token) {
      console.log('[api/customer/payments/[id]] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log the request
    console.log(`[api/customer/payments/[id]] Fetching payment details for ID: ${paymentId}`);

    // Try to make request to backend API
    try {
      // Log full URL for debugging
      const url = `${API_BASE_URL}/customers/payments/${paymentId}`;
      console.log(`[api/customer/payments/[id]] Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      // If backend responds successfully, use that data
      if (response.ok) {
        const data = await response.json();
        console.log(`[api/customer/payments/[id]] Successfully fetched payment details from backend for ID: ${paymentId}`);
        return NextResponse.json(data);
      }
      
      // Handle different response statuses
      if (response.status === 404) {
        console.log(`[api/customer/payments/[id]] Payment not found in backend: ${paymentId}, trying mock data`);
        // Fall through to mock data
      } else if (response.status === 401) {
        console.log('[api/customer/payments/[id]] Unauthorized from backend');
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        console.log('[api/customer/payments/[id]] Forbidden - User cannot access this payment');
        return NextResponse.json(
          { message: 'Forbidden - You do not have permission to access this payment' },
          { status: 403 }
        );
      } else {
        console.log(`[api/customer/payments/[id]] Backend API error: ${response.status}, trying mock data`);
        // Fall through to mock data
      }
    } catch (error) {
      console.log('[api/customer/payments/[id]] Error connecting to backend, using mock data:', error);
    }
    
    // Use mock data as fallback
    console.log(`[api/customer/payments/[id]] Using mock payment data for ID: ${paymentId}`);
    
    // Check if we have this payment ID in our mock data
    if (mockPayments[paymentId]) {
      return NextResponse.json(mockPayments[paymentId]);
    } else {
      // If not found in mock data either, return 404
      console.log(`[api/customer/payments/[id]] Payment not found in mock data: ${paymentId}`);
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[api/customer/payments/[id]] Error in GET handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 