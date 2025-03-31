import { NextRequest, NextResponse } from 'next/server';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Debug mode
const DEBUG_MODE = true;

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const orderNumber = params.orderNumber;
  console.log(`[API Route] /api/orders/by-number/${orderNumber}: GET request received`);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`[API Route] /api/orders/by-number/${orderNumber}: No token available`);
    
    if (DEBUG_MODE) {
      // For debugging, provide mock data when no token is available
      return NextResponse.json({
        statusCode: 200,
        message: 'Mock data returned (no token)',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for testing
          orderNumber: orderNumber,
          status: 'new',
          totalAmount: 150000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: '123456',
            name: 'Mock Customer',
            email: 'mock@example.com',
            phone: '081234567890'
          },
          items: [
            {
              id: '1',
              serviceName: 'Cuci + Setrika',
              quantity: 1,
              weight: 3.5,
              price: 10000,
              subtotal: 35000,
              weightBased: true
            },
            {
              id: '2',
              serviceName: 'Dry Cleaning',
              quantity: 2,
              price: 25000,
              subtotal: 50000,
              weightBased: false
            }
          ],
          payments: []
        }
      });
    }
    
    return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
  }
  
  try {
    console.log(`[API Route] Fetching order with order number: ${orderNumber}`);
    
    // Direct API call to the backend endpoint for getting an order by number
    const apiURL = `${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`;
    console.log(`[API Route] Calling backend API: ${apiURL}`);
    
    const response = await fetch(apiURL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Error fetching order with number ${orderNumber}:`, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Order not found',
          statusCode: response.status,
          message: errorJson.message || 'Unknown error'
        }, { status: response.status });
      } catch (e) {
        return NextResponse.json({ 
          error: 'Order not found',
          statusCode: response.status,
          message: errorText
        }, { status: response.status });
      }
    }
    
    const orderData = await response.json();
    console.log(`[API Route] Found order with number ${orderNumber}`);
    
    // Return the order data
    return NextResponse.json({
      statusCode: 200,
      message: 'Order successfully fetched',
      timestamp: new Date().toISOString(),
      data: orderData
    });
  } catch (error: any) {
    console.error(`[API Route] Error fetching order with number ${orderNumber}:`, error.message);
    
    if (DEBUG_MODE) {
      // For debugging, provide mock data when an error occurs
      return NextResponse.json({
        statusCode: 200,
        message: 'Mock data returned (error occurred)',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for testing
          orderNumber: orderNumber,
          status: 'new',
          totalAmount: 150000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: '123456',
            name: 'Mock Customer',
            email: 'mock@example.com',
            phone: '081234567890'
          },
          items: [
            {
              id: '1',
              serviceName: 'Cuci + Setrika',
              quantity: 1,
              weight: 3.5,
              price: 10000,
              subtotal: 35000,
              weightBased: true
            }
          ],
          payments: []
        },
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    return NextResponse.json({ 
      error: 'API request failed',
      statusCode: 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 