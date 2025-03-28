import axios from 'axios';
import { API_URL } from '@/config';
import api from '@/utils/api';

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  WASHING = 'washing',
  DRYING = 'drying',
  FOLDING = 'folding',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Legacy status mapping for backward compatibility
export const legacyStatusMap = {
  PENDING: OrderStatus.NEW,
  PROCESSING: OrderStatus.PROCESSING,
  COMPLETED: OrderStatus.READY,
  CANCELLED: OrderStatus.CANCELLED,
  DELIVERED: OrderStatus.DELIVERED,
};

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  subtotal: number;
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
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreateOrderDto {
  customerId: string;
  items: {
    serviceId: string;
    quantity: number;
    price: number;
  }[];
  status?: OrderStatus;
  totalWeight?: number;
  notes?: string;
  specialRequirements?: string;
  pickupDate?: string;
  deliveryDate?: string;
}

export interface UpdateOrderDto {
  customerId?: string;
  status?: OrderStatus;
  totalWeight?: number;
  notes?: string;
  specialRequirements?: string;
  pickupDate?: string;
  deliveryDate?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface OrderListResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  data: {
    data: {
      items: Order[];
      total: number;
      page: number;
      limit: number;
    };
    statusCode: number;
    message: string;
    timestamp: string;
  };
}

// Fungsi untuk mendapatkan semua pesanan
export const getOrders = async (filters: OrderFilters = {}): Promise<OrderListResponse> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      customerId, 
      fromDate, 
      toDate,
      search 
    } = filters;
    
    // Create query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(search && { search })
    });
    
    console.log('[getOrders] Fetching orders with filters:', filters);
    console.log('[getOrders] Full URL:', `/api/orders?${queryParams}`);
    
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getOrders] No CSRF token found in session storage. Trying to refresh...');
      // Try to refresh CSRF token if needed - can add this in a later implementation
    }
    
    // Use the simplified API route that automatically handles CSRF and authentication
    const response = await fetch(`/api/orders?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getOrders] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pesanan berdasarkan ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getOrderById] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/orders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getOrderById] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    const responseJson = await response.json();
    console.log('[getOrderById] Raw response data:', responseJson);
    
    // Extract data from nested response if necessary
    const orderData = responseJson.data || responseJson;
    console.log('[getOrderById] Extracted order data:', orderData);
    
    // Process the order data to ensure correct types
    const processedOrder = {
      ...orderData,
      // Ensure totalAmount is a number
      totalAmount: typeof orderData.totalAmount === 'string' ? parseFloat(orderData.totalAmount) : (orderData.totalAmount || 0),
      // Set customerName from customer object if available
      customerName: orderData.customerName || (orderData.customer ? orderData.customer.name : '')
    };
    
    return processedOrder;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pesanan baru
export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[createOrder] No CSRF token found in session storage');
    }
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(data),
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[createOrder] API error:', errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    const responseJson = await response.json();
    console.log('[createOrder] Raw response data:', responseJson);
    
    // Extract data from nested response if necessary
    const createdOrder = responseJson.data || responseJson;
    console.log('[createOrder] Extracted order data:', createdOrder);
    
    return createdOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate pesanan
export const updateOrder = async (id: string, data: UpdateOrderDto): Promise<Order> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[updateOrder] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(data),
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updateOrder] API error for ID ${id}:`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    const responseJson = await response.json();
    console.log('[updateOrder] Raw response data:', responseJson);
    
    // Extract data from nested response if necessary
    const updatedOrder = responseJson.data || responseJson;
    console.log('[updateOrder] Extracted order data:', updatedOrder);
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pesanan
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[deleteOrder] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deleteOrder] API error for ID ${id}:`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    console.log('[deleteOrder] Delete response:', await response.json());
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mengupdate status pesanan
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[updateOrderStatus] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify({ status }),
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updateOrderStatus] API error for ID ${id}:`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    const responseJson = await response.json();
    console.log('[updateOrderStatus] Raw response data:', responseJson);
    
    // Extract data from nested response if necessary
    const updatedOrder = responseJson.data || responseJson;
    console.log('[updateOrderStatus] Extracted order data:', updatedOrder);
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }
};