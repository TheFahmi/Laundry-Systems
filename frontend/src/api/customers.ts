import axios from 'axios';
import { API_URL } from '@/config';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerListResponse {
  data: {
    items: Customer[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
  message: string;
  timestamp: string;
}

// Fungsi untuk mendapatkan semua pelanggan
export const getCustomers = async (filters: CustomerFilters = {}): Promise<CustomerListResponse> => {
  try {
    const { page = 1, limit = 10, search } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getCustomers] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/customers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getCustomers] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pelanggan berdasarkan ID
export const getCustomerById = async (id: string): Promise<Customer> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getCustomerById] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/customers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getCustomerById] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mencari pelanggan berdasarkan nomor telepon atau nama
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[searchCustomers] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/customers/search?q=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[searchCustomers] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error searching customers with query ${query}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pelanggan baru
export const createCustomer = async (data: CreateCustomerDto): Promise<Customer> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[createCustomer] No CSRF token found in session storage');
    }
    
    const response = await fetch('/api/customers', {
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
      console.error(`[createCustomer] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate pelanggan
export const updateCustomer = async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[updateCustomer] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/customers/${id}`, {
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
      console.error(`[updateCustomer] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pelanggan
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[deleteCustomer] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deleteCustomer] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);
    throw error;
  }
}; 