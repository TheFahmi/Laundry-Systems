import api from '@/utils/api';

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
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  totalWeight: number;
  notes?: string;
  specialRequirements?: string;
  pickupDate?: string;
  deliveryDate?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
  };
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

/**
 * Fetch orders with optional filtering
 */
export async function getOrders(params: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}): Promise<OrdersResponse> {
  try {
    const { page = 1, limit = 10, status, search } = params;
    
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get order details by ID
 */
export async function getOrder(id: string): Promise<AnyData> {
  try {
    // Use a properly formatted path with slashes instead of nested paths
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: any): Promise<SingleOrderResponse> {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing order
 */
export async function updateOrder(id: string, updateData: any): Promise<SingleOrderResponse> {
  try {
    const response = await api.patch(`/orders/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<AnyData> {
  try {
    // Use a properly formatted path with slashes
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string): Promise<void> {
  try {
    await api.delete(`/orders/${id}`);
    return;
  } catch (error) {
    throw error;
  }
}

/**
 * Get order details by order number
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<AnyData> {
  try {
    // Use a specific API route for order number lookups
    const response = await api.get(`/api/orders/by-number/${orderNumber}`);
    return response.data;
  } catch (error) {
    throw error;
  }
} 