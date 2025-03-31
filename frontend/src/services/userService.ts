import { User, UserRole } from '@/types/user';
import { fetchWithAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface UserResponse {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreateUserData {
  username: string;
  password: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
}

interface UpdateUserData {
  username?: string;
  password?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface UserQueryParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const generateCacheBuster = () => {
  return `_cb=${Date.now()}`;
}

export async function getUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const url = `${API_URL}/users?${queryParams.toString()}?${generateCacheBuster()}`;
    return await fetchWithAuth<UserListResponse>(url);
  } catch (error) {
    throw error;
  }
}

export const getUserById = async (id: number): Promise<User> => {
  const url = `${API_URL}/users/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user with ID ${id}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    return await fetchWithAuth<User>(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  try {
    return await fetchWithAuth<User>(`${API_URL}/users/${id}?${generateCacheBuster()}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await fetchWithAuth(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw error;
  }
}; 