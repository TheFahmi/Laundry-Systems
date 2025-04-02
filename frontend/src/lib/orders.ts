import { fetchWithAuth } from '@/utils/api';

// Define types for order data
export type OrderStatus = 
  | 'new'
  | 'processing'
  | 'washing'
  | 'drying'
  | 'folding'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  weight?: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_id: string;
  orderNumber?: string;
  name: string;
  phone: string;
  status: string;
  items: OrderItem[];
  total_price: number;
  totalAmount?: number;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  // Add other fields as needed
}

export interface OrdersData {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface AnyData {
  [key: string]: any;
}

export interface OrdersResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  data: AnyData;
}

export interface SingleOrderResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  data: AnyData;
}

export interface OrderParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  [key: string]: any;
}

/**
 * Fetch orders with optional filtering
 */
export async function getOrders(params?: OrderParams) {
  try {
    // Add query parameters to the URL if provided
    const queryString = params 
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
      
    const response = await fetchWithAuth(`/api/orders${queryString}`);
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get order details by ID
 */
export async function getOrderById(id: string) {
  try {
    console.log(`Fetching order with ID: ${id} using Next.js API route`);
    const response = await fetchWithAuth(`/api/orders/by-id/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: any) {
  try {
    const response = await fetchWithAuth('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update an existing order
 */
export async function updateOrder(id: string, orderData: any) {
  try {
    const response = await fetchWithAuth(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
    return response;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<AnyData> {
  try {
    // Use a properly formatted path with slashes
    const response = await fetchWithAuth(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string) {
  try {
    const response = await fetchWithAuth(`/api/orders/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
}

/**
 * Get order details by order number
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<AnyData> {
  try {
    // Use a specific API route for order number lookups
    const response = await fetchWithAuth(`/api/orders/by-number/${orderNumber}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Verification function for order tracking
export async function verifyOrderWithPhone(orderId: string, phoneLastFour: string) {
  try {
    const response = await fetch('/api/order-tracking/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, phoneLastFour }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying order:', error);
    throw error;
  }
}

// Get order status for tracking
export async function getOrderStatus(orderId: string, verificationToken: string) {
  try {
    const response = await fetch(`/api/order-tracking/status?orderId=${orderId}`, {
      headers: {
        'Authorization': `Bearer ${verificationToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get order status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
} 