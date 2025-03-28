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

// Fungsi untuk mendapatkan semua pembayaran
export const getPayments = async (filters: PaymentFilters = {}): Promise<PaymentListResponse> => {
  try {
    const { page = 1, limit = 10, status, method } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(method && { method })
    });
    
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getPayments] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/payments?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getPayments] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pembayaran berdasarkan ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getPaymentById] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/payments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getPaymentById] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pembayaran berdasarkan ID pesanan
export const getPaymentsByOrderId = async (orderId: string): Promise<Payment[]> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getPaymentsByOrderId] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/payments/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getPaymentsByOrderId] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching payments for order ${orderId}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pembayaran baru
export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[createPayment] No CSRF token found in session storage');
    }
    
    const response = await fetch('/api/payments', {
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
      console.error(`[createPayment] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Fungsi untuk memperbarui data pembayaran
export const updatePayment = async (id: string, data: UpdatePaymentDto): Promise<Payment> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[updatePayment] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify(data),
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updatePayment] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pembayaran
export const deletePayment = async (id: string): Promise<void> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[deletePayment] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deletePayment] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    throw error;
  }
};