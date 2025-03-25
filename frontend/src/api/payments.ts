import axios from 'axios';
import { API_URL } from '@/config';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'ewallet' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface Payment {
  id: string;
  orderId: string;
  customerName?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  orderId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  amount?: number;
  transactionId?: string;
  notes?: string;
}

export interface PaymentListResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}

// Fungsi untuk mendapatkan semua data pembayaran
export const getPayments = async (filters: PaymentFilters = {}): Promise<PaymentListResponse> => {
  const { page = 1, limit = 10, status, method } = filters;
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(method && { method })
    });
    
    const response = await axios.get(`${API_URL}/payments?${queryParams}`);
    
    // Handle both response formats (backward compatibility)
    if (response.data.data && response.data.meta) {
      // New format with data/meta structure
      return {
        items: response.data.data,
        total: response.data.meta.total || 0,
        page: response.data.meta.page || page,
        limit: response.data.meta.limit || limit
      };
    } else if (Array.isArray(response.data)) {
      // Handle case where response is just an array of payments
      return {
        items: response.data,
        total: response.data.length,
        page: page,
        limit: limit
      };
    } else {
      // Original format or any other format
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan detail pembayaran berdasarkan ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const response = await axios.get(`${API_URL}/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pembayaran berdasarkan ID pesanan
export const getPaymentsByOrderId = async (orderId: string): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for order ${orderId}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pembayaran baru
export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  try {
    const response = await axios.post(`${API_URL}/payments`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Fungsi untuk memperbarui data pembayaran
export const updatePayment = async (id: string, data: UpdatePaymentDto): Promise<Payment> => {
  try {
    const response = await axios.put(`${API_URL}/payments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pembayaran
export const deletePayment = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/payments/${id}`);
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    throw error;
  }
};