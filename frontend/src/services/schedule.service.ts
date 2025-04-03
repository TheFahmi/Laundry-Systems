import { apiClient } from '@/lib/api-client';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ScheduleDate {
  date: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface ScheduleRequest {
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  addressId: string;
  notes?: string;
  paymentMethod?: string;
}

// API wrapper response format
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

export class ScheduleService {
  /**
   * Get available dates for scheduling pickup
   */
  static async getAvailableDates(startDate: string, endDate: string): Promise<ScheduleDate[]> {
    try {
      const response = await apiClient.get<ApiResponse<ScheduleDate[]>>(
        `/api/schedule/available-dates?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch available dates:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a specific date
   */
  static async getTimeSlots(date: string): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get<ApiResponse<TimeSlot[]>>(
        `/api/schedule/time-slots?date=${date}`
      );
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      throw error;
    }
  }

  /**
   * Create a new schedule
   */
  static async createSchedule(scheduleData: ScheduleRequest): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/api/schedule', scheduleData
      );
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated delivery dates based on pickup date
   */
  static async calculateDeliveryDates(pickupDate: string): Promise<ScheduleDate[]> {
    try {
      const response = await apiClient.get<ApiResponse<ScheduleDate[]>>(
        `/api/schedule/delivery-dates?pickupDate=${pickupDate}`
      );
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to calculate delivery dates:', error);
      throw error;
    }
  }
} 