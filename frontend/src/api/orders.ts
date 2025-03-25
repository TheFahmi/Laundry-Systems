import axios from 'axios';
import { API_URL } from '@/config';

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
  customerName: string;
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
  items: Order[];
  total: number;
  page: number;
  limit: number;
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
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(search && { search })
    });
    
    const response = await axios.get(`${API_URL}/orders?${queryParams}`);
    
    // Handle different response formats
    if (response.data.items) {
      // New format with items/total/page/limit structure
      return response.data;
    } else if (response.data.data) {
      // Old format with data/meta structure
      return {
        items: response.data.data,
        total: response.data.meta.total || 0,
        page: response.data.meta.page || page,
        limit: response.data.meta.limit || limit
      };
    } else if (Array.isArray(response.data)) {
      // Direct array format
      return {
        items: response.data,
        total: response.data.length,
        page: page,
        limit: limit
      };
    } else {
      console.error('Unexpected API response format:', response.data);
      return {
        items: [],
        total: 0,
        page: page,
        limit: limit
      };
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pesanan berdasarkan ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pesanan baru
export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  try {
    const response = await axios.post(`${API_URL}/orders`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate pesanan
export const updateOrder = async (id: string, data: UpdateOrderDto): Promise<Order> => {
  try {
    const response = await axios.put(`${API_URL}/orders/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pesanan
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/orders/${id}`);
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mengupdate status pesanan
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }
};