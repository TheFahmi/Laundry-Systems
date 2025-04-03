import { apiClient } from '@/lib/api-client';

export interface TrackOrderRequest {
  orderNumber: string;
}

export interface OrderItemResponse {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TrackOrderResponse {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  subStatus?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  deliveryDate: string | null;
  paymentStatus: string;
  items?: OrderItemResponse[];
  
  // Timeline-related timestamps
  pickupAt?: string;
  washingAt?: string;
  dryingAt?: string;
  ironingAt?: string;
  deliveryAt?: string;
  readyForPickupAt?: string;
  completedAt?: string;
}

// API wrapper response format
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

export class OrderService {
  /**
   * Track an order by its order number
   * 
   * @param orderNumber Order number in the format ORD-YYYYMMDD-XXXXX
   * @returns Order tracking information
   */
  static async trackOrder(orderNumber: string): Promise<TrackOrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<TrackOrderResponse>>('/api/public/orders/track', {
        orderNumber
      });
      
      // Extract the data from the wrapper response
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  }

  /**
   * Get all orders for the current customer
   * 
   * @param page Page number
   * @param limit Items per page
   * @param status Filter by status
   * @returns Orders list
   */
  static async getOrders(page = 1, limit = 10, status?: string): Promise<any> {
    try {
      let url = `/api/orders?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  /**
   * Get order details by ID
   * 
   * @param orderId Order ID
   * @returns Order details
   */
  static async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order details for ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new order
   * 
   * @param orderData Order data
   * @returns Created order
   */
  static async createOrder(orderData: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   * 
   * @param orderId Order ID
   * @returns Cancelled order
   */
  static async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      
      // Extract relevant error information from the response
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.message || 'Pesanan tidak dapat dibatalkan';
        
        // Create and throw enhanced error
        const enhancedError = new Error(errorMessage);
        enhancedError.name = 'CancelOrderError';
        (enhancedError as any).status = error.response.status;
        (enhancedError as any).response = { data: errorData };
        
        throw enhancedError;
      }
      
      throw error;
    }
  }
} 