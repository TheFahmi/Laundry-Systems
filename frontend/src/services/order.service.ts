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

export class OrderService {
  /**
   * Track an order by its order number
   * 
   * @param orderNumber Order number in the format ORD-YYYYMMDD-XXXXX
   * @returns Order tracking information
   */
  static async trackOrder(orderNumber: string): Promise<TrackOrderResponse> {
    try {
      const response = await apiClient.post('/public/orders/track', {
        orderNumber
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  }
} 