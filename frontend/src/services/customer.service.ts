import { apiClient } from '@/lib/api-client';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  loyaltyPoints: number;
  profileImage?: string;
  avatarUrl: string | null;
}

export interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  pendingPayments: number;
  loyaltyPoints: number;
}

export interface CustomerAddress {
  id: string;
  name: string;
  address: string;
  details?: string;
  isDefault: boolean;
  phone?: string;
  notes?: string;
}

// API wrapper response format
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

export class CustomerService {
  /**
   * Get customer profile information
   */
  static async getProfile(): Promise<CustomerProfile> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerProfile>>('/api/customer/profile');
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
      throw error;
    }
  }

  /**
   * Update customer profile
   */
  static async updateProfile(profileData: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      const response = await apiClient.put<ApiResponse<CustomerProfile>>('/api/customer/profile', profileData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to update customer profile:', error);
      throw error;
    }
  }

  /**
   * Get customer dashboard statistics
   */
  static async getDashboardStats(): Promise<CustomerStats> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerStats>>('/api/customer/stats');
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
      throw error;
    }
  }

  /**
   * Get customer saved addresses
   */
  static async getAddresses(): Promise<CustomerAddress[]> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerAddress[]>>('/api/customer/addresses');
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch customer addresses:', error);
      throw error;
    }
  }

  /**
   * Add a new address
   */
  static async addAddress(address: Omit<CustomerAddress, 'id'>): Promise<CustomerAddress> {
    try {
      const response = await apiClient.post<ApiResponse<CustomerAddress>>('/api/customer/addresses', address);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to add customer address:', error);
      throw error;
    }
  }

  /**
   * Update existing address
   */
  static async updateAddress(id: string, address: Partial<CustomerAddress>): Promise<CustomerAddress> {
    try {
      const response = await apiClient.put<ApiResponse<CustomerAddress>>(`/api/customer/addresses/${id}`, address);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to update customer address:', error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/customer/addresses/${id}`);
    } catch (error) {
      console.error('Failed to delete customer address:', error);
      throw error;
    }
  }

  /**
   * Change customer password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/api/customer/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }
} 