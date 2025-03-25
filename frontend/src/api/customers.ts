import axios from 'axios';
import { API_URL } from '@/config';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
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
  data: Customer[];
  meta: {
    total: number;
    page: number | string;
    limit: number | string;
    totalPages: number;
  };
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
    
    const response = await axios.get(`${API_URL}/customers?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pelanggan berdasarkan ID
export const getCustomerById = async (id: string): Promise<Customer> => {
  try {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mencari pelanggan berdasarkan nomor telepon atau nama
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  try {
    const response = await axios.get(`${API_URL}/customers/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching customers with query ${query}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat pelanggan baru
export const createCustomer = async (data: CreateCustomerDto): Promise<Customer> => {
  try {
    const response = await axios.post(`${API_URL}/customers`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate pelanggan
export const updateCustomer = async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
  try {
    const response = await axios.put(`${API_URL}/customers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus pelanggan
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/customers/${id}`);
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);
    throw error;
  }
}; 