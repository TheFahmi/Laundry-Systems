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
  isDeliveryNeeded?: boolean;
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
  isDeliveryNeeded?: boolean;
}

export interface UpdateOrderDto {
  customerId?: string;
  status?: OrderStatus;
  totalWeight?: number;
  notes?: string;
  specialRequirements?: string;
  pickupDate?: string;
  deliveryDate?: string;
  isDeliveryNeeded?: boolean;
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
    
    // Use axios (which now has interceptors configured with CSRF tokens)
    const response = await axios.get(`/api/orders?${queryParams}`, {
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pesanan berdasarkan ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    // Use axios for consistent error handling with interceptors
    const response = await axios.get(`/api/orders/${id}`, {
      withCredentials: true
    });
    
    const responseData = response.data;
    
    // Extract data from nested response if necessary
    const orderData = responseData.data || responseData;
    
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
    // Use axios for consistent error handling with interceptors
    const response = await axios.post('/api/orders', data, {
      withCredentials: true
    });
    
    const responseData = response.data;
    
    // Extract data from nested response if necessary
    const createdOrder = responseData.data || responseData;
    
    return createdOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate pesanan
export const updateOrder = async (id: string, data: UpdateOrderDto): Promise<Order> => {
  try {
    // Use axios for consistent error handling with interceptors
    const response = await axios.put(`/api/orders/${id}`, data, {
      withCredentials: true
    });
    
    const responseData = response.data;
    
    // Extract data from nested response if necessary
    const updatedOrder = responseData.data || responseData;
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pesanan
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    // Use axios for consistent error handling with interceptors
    await axios.delete(`/api/orders/${id}`, {
      withCredentials: true
    });
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mengupdate status pesanan
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    // Use axios for consistent error handling with interceptors
    const response = await axios.patch(`/api/orders/${id}/status`, { status }, {
      withCredentials: true
    });
    
    const responseData = response.data;
    
    // Extract data from nested response if necessary
    const updatedOrder = responseData.data || responseData;
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }
};