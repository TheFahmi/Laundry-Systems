import { apiClient } from '@/lib/api-client';

export interface TrackOrderRequest {
  orderNumber: string;
}

export interface TrackOrderResponse {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  deliveryDate: string | null;
  paymentStatus: string;
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
      const response = await apiClient.post<ApiResponse<TrackOrderResponse>>('/public/orders/track', {
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
} 