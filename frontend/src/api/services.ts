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
    
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getServices] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/services?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getServices] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan layanan berdasarkan ID
export const getServiceById = async (id: string): Promise<LaundryService> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getServiceById] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/services/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getServiceById] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk membuat layanan baru
export const createService = async (data: CreateServiceDto): Promise<LaundryService> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[createService] No CSRF token found in session storage');
    }
    
    const response = await fetch('/api/services', {
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
      console.error(`[createService] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Fungsi untuk mengupdate layanan
export const updateService = async (id: string, data: UpdateServiceDto): Promise<LaundryService> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[updateService] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/services/${id}`, {
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
      console.error(`[updateService] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus layanan
export const deleteService = async (id: string): Promise<void> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[deleteService] No CSRF token found in session storage');
    }
    
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deleteService] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk mendapatkan kategori layanan
export const getServiceCategories = async (): Promise<string[]> => {
  try {
    // Try to get CSRF token from sessionStorage
    const csrfToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
    
    if (!csrfToken) {
      console.warn('[getServiceCategories] No CSRF token found in session storage');
    }
    
    const response = await fetch('/api/services/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include' // Include cookies automatically
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getServiceCategories] API error (${response.status}):`, errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}; 