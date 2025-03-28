import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-20250327-001",
    customerId: "cust-1",
    customerName: "John Doe",
    status: "new",
    totalAmount: 50000,
    totalWeight: 2.5,
    notes: "Handle with care",
    specialRequirements: "",
    createdAt: "2025-03-27T14:30:00.000Z",
    updatedAt: "2025-03-27T14:30:00.000Z",
    items: [
      {
        id: "item-1",
        orderId: "1",
        serviceId: "service-1",
        serviceName: "Regular Wash",
        quantity: 2,
        price: 25000,
        subtotal: 50000
      }
    ],
    customer: {
      id: "cust-1",
      name: "John Doe",
      phone: "081234567890",
      email: "john@example.com",
      address: "Jl. Example No. 123"
    }
  },
  {
    id: "2",
    orderNumber: "ORD-20250327-002",
    customerId: "cust-2",
    customerName: "Jane Smith",
    status: "processing",
    totalAmount: 75000,
    totalWeight: 3.0,
    notes: "",
    specialRequirements: "Fragrance free",
    createdAt: "2025-03-27T13:00:00.000Z",
    updatedAt: "2025-03-27T13:15:00.000Z",
    items: [
      {
        id: "item-2",
        orderId: "2",
        serviceId: "service-2",
        serviceName: "Dry Cleaning",
        quantity: 3,
        price: 25000,
        subtotal: 75000
      }
    ],
    customer: {
      id: "cust-2",
      name: "Jane Smith",
      phone: "089876543210",
      email: "jane@example.com",
      address: "Jl. Sample No. 456"
    }
  }
];

export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  // Add artificial delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = mockOrders.slice(startIndex, endIndex);
  
  console.log('[MOCK API] Request received for orders with params:', {
    page, 
    limit,
    search: searchParams.get('search') || 'none',
    status: searchParams.get('status') || 'all'
  });
  
  console.log('[MOCK API] Returning', paginatedOrders.length, 'of', mockOrders.length, 'orders');
  
  // Return data in the format that backend returns
  const response = {
    items: paginatedOrders,
    total: mockOrders.length,
    page: page,
    limit: limit
  };
  
  console.log('[MOCK API] Response structure:', Object.keys(response));
  console.log('[MOCK API] First item structure:', response.items[0] ? Object.keys(response.items[0]) : 'no items');
  
  // Return mock data
  return NextResponse.json(response);
} 