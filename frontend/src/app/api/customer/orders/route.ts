import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * GET handler for customer orders
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL search params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const includePayments = searchParams.get('include_payments') === 'true';
    
    // Construct the query parameters for the backend API
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    
    // Add include_payments parameter to get payment data with orders
    if (includePayments) {
      queryParams.append('include_payments', 'true');
    }
    
    // Get authentication token from cookies or Authorization header
    const cookieStore = cookies();
    const token = cookieStore.get?.('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is authenticated
    if (!token) {
      console.log('[api/customer/orders] Not authenticated');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Make request to backend API to get orders
    try {
      const response = await fetch(`${API_BASE_URL}/customers/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      // Get response data
      const data = await response.json();

      // Handle different response statuses
      if (!response.ok) {
        if (response.status === 401) {
          console.log('[api/customer/orders] Unauthorized');
          return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        console.log(`[api/customer/orders] Backend API error: ${response.status}`);
        return NextResponse.json(
          { message: 'Error fetching orders', error: data },
          { status: response.status }
        );
      }

      // If include_payments is true but backend didn't return payments data,
      // make additional requests to get payment data for each order
      if (includePayments && data.items && Array.isArray(data.items)) {
        // For each order, try to get its payment data
        const ordersWithPayments = await Promise.all(data.items.map(async (order: any) => {
          // Skip if order already has payment data
          if (order.payments || order.payment) {
            return order;
          }
          
          try {
            // Try to get payments for this order
            const paymentResponse = await fetch(`${API_BASE_URL}/customers/orders/${order.id}/payments`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            });
            
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              
              // Check if we got payment data
              if (paymentData && paymentData.items && paymentData.items.length > 0) {
                // Add payments array to order
                order.payments = paymentData.items;
              } else if (paymentData && !Array.isArray(paymentData)) {
                // Single payment object
                order.payment = paymentData;
              }
            }
          } catch (err) {
            console.error(`Error fetching payments for order ${order.id}:`, err);
            // Continue with order without payment data
          }
          
          return order;
        }));
        
        // Replace items with ordersWithPayments
        data.items = ordersWithPayments;
      }

      // Return successful response
      return NextResponse.json(data);
    } catch (error) {
      console.error('[api/customer/orders] Error in API call:', error);
      
      // If there's an issue with the API connection, return mock data for testing/development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[api/customer/orders] Using mock data for development');
        
        // Generate mock orders data
        const mockOrders = generateMockOrders(parseInt(page), parseInt(limit), includePayments);
        
        return NextResponse.json(mockOrders);
      }
      
      return NextResponse.json(
        { message: 'Failed to connect to orders service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[api/customer/orders] Error in GET handler:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock orders data for development
 */
function generateMockOrders(page: number, limit: number, includePayments: boolean) {
  // Create base mock orders
  const mockOrders = Array.from({ length: 20 }, (_, i) => {
    const id = `mock-ord-${String(i + 1).padStart(3, '0')}`;
    const orderNumber = `ORD-MOCK-${String(i + 1).padStart(5, '0')}`;
    const createdDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)); // Each order 1 day apart
    const price = Math.floor(Math.random() * 10 + 1) * 15000; // Random price between 15k-150k
    
    // Random status
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Base order
    const order = {
      id,
      orderNumber,
      customerId: 'customer-id',
      totalPrice: price,
      status,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 3600000).toISOString(),
      items: [
        {
          id: `item-${id}-1`,
          serviceName: 'Cuci + Setrika',
          quantity: Math.floor(Math.random() * 5) + 1,
          price: 15000
        }
      ]
    };
    
    // Add payment data if requested
    if (includePayments && (status === 'processing' || status === 'completed')) {
      // Create mock payment
      const payment = {
        id: `pay-${id}`,
        amount: price,
        paymentMethod: ['cash', 'bank_transfer', 'credit_card'][Math.floor(Math.random() * 3)],
        status: status === 'completed' ? 'completed' : 'pending',
        transactionId: status === 'completed' ? `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
        referenceNumber: `PAY-${orderNumber.substring(4)}`,
        notes: status === 'completed' ? 'Payment completed' : 'Awaiting payment confirmation',
        createdAt: new Date(createdDate.getTime() + 1800000).toISOString(),
        updatedAt: status === 'completed' ? 
                   new Date(createdDate.getTime() + 7200000).toISOString() : 
                   new Date(createdDate.getTime() + 1800000).toISOString()
      };
      
      // Add payment directly to order
      order.payment = payment;
    }
    
    return order;
  });
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = mockOrders.slice(startIndex, endIndex);
  
  return {
    items: paginatedOrders,
    total: mockOrders.length,
    page,
    limit
  };
} 