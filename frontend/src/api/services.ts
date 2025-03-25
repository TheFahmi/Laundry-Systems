import axios from 'axios';
import { API_URL } from '@/config';

export interface LaundryService {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedTime: number; // dalam jam
  category: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  estimatedTime: number;
  category: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  estimatedTime?: number;
  category?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface ServiceListResponse {
  items: LaundryService[];
  total: number;
  page: number;
  limit: number;
}

// Fungsi untuk mendapatkan semua layanan
export const getServices = async (filters: ServiceFilters = {}): Promise<ServiceListResponse> => {
  try {
    const { page = 1, limit = 10, category, isActive, search } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(isActive !== undefined && { isActive: isActive.toString() }),
      ...(search && { search })
    });
    
    const response = await axios.get(`${API_URL}/services?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan layanan berdasarkan ID
export const getServiceById = async (id: string): Promise<LaundryService> => {
  try {
    const response = await axios.get(`${API_URL}/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat layanan baru
export const createService = async (data: CreateServiceDto): Promise<LaundryService> => {
  try {
    const response = await axios.post(`${API_URL}/services`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate layanan
export const updateService = async (id: string, data: UpdateServiceDto): Promise<LaundryService> => {
  try {
    const response = await axios.put(`${API_URL}/services/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus layanan
export const deleteService = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/services/${id}`);
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan kategori layanan
export const getServiceCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/services/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}; 