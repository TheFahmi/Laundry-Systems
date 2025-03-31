import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeaders } from '@/lib/api-utils';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log('[API Route] Order by ID lookup using backend URL:', API_BASE_URL);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log(`[Order API] Fetching order with ID: ${params.id}`);
    
    const headers = createAuthHeaders();
    
    // First try to get the order directly by UUID
    const orderUrl = `${API_BASE_URL}/orders/${params.id}`;
    console.log(`[Order API] Fetching from: ${orderUrl}`);
    
    try {
      const response = await fetch(orderUrl, {
        headers,
        cache: 'no-store'
      });
      
      console.log(`[Order API] Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Order API] Error fetching order by ID:`, errorText);
        
        // If not found by ID, try searching by order_id filter
        console.log(`[Order API] Order not found by ID, trying search`);
        
        // Try to search for the order in the list
        const searchUrl = `${API_BASE_URL}/orders?order_id=${params.id}`;
        console.log(`[Order API] Searching using: ${searchUrl}`);
        
        const searchResponse = await fetch(searchUrl, {
          headers,
          cache: 'no-store'
        });
        
        if (!searchResponse.ok) {
          const searchErrorText = await searchResponse.text();
          console.error(`[Order API] Error searching for order:`, searchErrorText);
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
        const searchData = await searchResponse.json();
        console.log(`[Order API] Search results:`, searchData);
        
        if (searchData.data && searchData.data.length > 0) {
          return NextResponse.json({
            statusCode: 200,
            message: 'Order found by search',
            data: searchData.data[0]
          });
        } else {
          return NextResponse.json(
            { error: 'Order not found in search results' },
            { status: 404 }
          );
        }
      }
      
      const data = await response.json();
      console.log(`[Order API] Order found:`, data);
      
      return NextResponse.json({
        statusCode: 200,
        message: 'Order found',
        data: data.data
      });
    } catch (error) {
      console.error('[Order API] Network error fetching order:', error);
      return NextResponse.json(
        { error: 'Network error fetching order', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Order API] Error in order lookup:', error);
    return NextResponse.json(
      { error: 'Failed to look up order', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 