import { NextRequest, NextResponse } from 'next/server';
import { createAuthHeaders } from '@/lib/api-utils';

// Backend API base URL - ensure it's correct
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
): Promise<NextResponse> {
  try {
    // Get orderNumber from params
    const { orderNumber } = params;
    
    if (!orderNumber) {
      return NextResponse.json(
        { message: 'Order number is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const requestData = await request.json();
    const { status, orderId } = requestData;

    console.log(`Updating order status for Order Number ${orderNumber}`, { 
      status, 
      providedOrderId: orderId || 'not provided in request' 
    });

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // First, get the order to extract the UUID
    const headers = createAuthHeaders();
    
    // Add cache control headers to prevent caching
    const noCacheHeaders = {
      ...headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Use direct orderId from request if provided
    let orderUUID = orderId;
    
    // Generate cache buster for all requests
    const cacheBuster = `_cb=${Date.now()}`;
    
    // If not provided in request, fetch it from API
    if (!orderUUID) {
      // Log that we're getting the order details to extract UUID
      console.log(`Getting order details to extract UUID for ${orderNumber}`);
      
      // Get order details from API - Note: The endpoint might be different (number/ vs by-number/)
      try {
        // First try with /orders/number/ endpoint
        const fetchResponse = await fetch(`${API_BASE_URL}/orders/number/${orderNumber}?${cacheBuster}`, {
          method: 'GET',
          headers: noCacheHeaders,
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (fetchResponse.ok) {
          // Parse order data
          const orderData = await fetchResponse.json();
          console.log('Order data response from /orders/number/:', orderData);

          // Extract order UUID from nested data structure
          if (orderData.data) {
            orderUUID = orderData.data.id;
          } else if (orderData.order) {
            orderUUID = orderData.order.id;
          } else if (orderData.id) {
            orderUUID = orderData.id;
          }
        } else {
          console.log(`Failed to fetch order with /orders/number/ endpoint: ${fetchResponse.status}. Trying alternative...`);
        }
      } catch (err) {
        console.log('Error fetching from /orders/number/ endpoint:', err);
      }

      // If the first endpoint failed, try alternative endpoint
      if (!orderUUID) {
        try {
          const altFetchResponse = await fetch(`${API_BASE_URL}/orders/by-number/${orderNumber}?${cacheBuster}`, {
            method: 'GET',
            headers: noCacheHeaders,
            cache: 'no-store',
            next: { revalidate: 0 }
          });

          if (altFetchResponse.ok) {
            // Parse order data
            const orderData = await altFetchResponse.json();
            console.log('Order data response from /orders/by-number/:', orderData);

            // Extract order UUID
            if (orderData.data) {
              orderUUID = orderData.data.id;
            } else if (orderData.order) {
              orderUUID = orderData.order.id;
            } else if (orderData.id) {
              orderUUID = orderData.id;
            }
          } else {
            console.error(`Failed to fetch order with alternative endpoint: ${altFetchResponse.status}`);
            const errorText = await altFetchResponse.text();
            return NextResponse.json(
              { message: `Failed to fetch order details: ${errorText}` },
              { status: altFetchResponse.status }
            );
          }
        } catch (err: any) {
          console.error('Error fetching from alternative endpoint:', err);
          return NextResponse.json(
            { message: `Error fetching order details: ${err.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Validate that we have a UUID
    if (!orderUUID) {
      console.error('Could not extract order UUID from API response');
      return NextResponse.json(
        { message: 'Could not find order UUID' },
        { status: 404 }
      );
    }

    // Validate the UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderUUID)) {
      console.error(`Invalid UUID format: ${orderUUID}`);
      return NextResponse.json(
        { message: 'Invalid UUID format' },
        { status: 400 }
      );
    }

    // Format UUID to lowercase for consistency
    orderUUID = orderUUID.toLowerCase();
    
    // Now update the status using the UUID
    console.log(`Updating status to ${status} for order UUID: ${orderUUID}`);

    // Important: The endpoint is just /orders/{uuid}/status without any prefix
    const statusEndpoint = `${API_BASE_URL}/orders/${orderUUID}/status?${cacheBuster}`;
    console.log(`Sending PATCH request to: ${statusEndpoint}`);

    const updateResponse = await fetch(statusEndpoint, {
      method: 'PATCH',
      headers: {
        ...noCacheHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status }),
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    // Get response text first for debugging
    const responseText = await updateResponse.text();
    console.log(`Status update response (${updateResponse.status}):`, responseText);

    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, use the text response
      responseData = { message: responseText };
    }

    if (!updateResponse.ok) {
      console.error(`Status update failed with code: ${updateResponse.status}`, responseData);
      
      // If this is a 400 error with UUID validation issues, try using a different format
      if (updateResponse.status === 400 && responseText.includes('uuid is expected')) {
        console.log('UUID validation error. This might be a problem with the UUID format or endpoint structure.');
      }
      
      return NextResponse.json(
        { 
          message: responseData.message || `Failed to update order status: ${updateResponse.status}`,
          error: responseData.error || null,
          details: responseData
        },
        { status: updateResponse.status }
      );
    }

    // Success response with cache control headers
    const response = NextResponse.json(
      { 
        message: 'Order status updated successfully',
        success: true,
        data: responseData
      },
      { status: 200 }
    );
    
    // Add cache control headers to the response
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating order status' },
      { status: 500 }
    );
  }
} 