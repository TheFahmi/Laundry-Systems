import axios from 'axios';
import { API_URL } from '@/config';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  role?: 'admin' | 'staff' | 'manager';
}

// Fungsi untuk login
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // Coba login menggunakan backend
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      
      // Simpan token di localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set token untuk semua request berikutnya
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (backendError) {
      console.warn('Backend login failed, falling back to API route:', backendError);
      
      // Jika backend gagal, gunakan API route lokal sebagai fallback
      try {
        const fallbackResponse = await axios.post('/api/auth/login', data);
        
        // Simpan token di localStorage
        if (fallbackResponse.data.token) {
          localStorage.setItem('token', fallbackResponse.data.token);
          localStorage.setItem('user', JSON.stringify(fallbackResponse.data.user));
          
          // Set token untuk semua request berikutnya
          axios.defaults.headers.common['Authorization'] = `Bearer ${fallbackResponse.data.token}`;
        }
        
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        // Throw a more specific error for authentication failures
        if (fallbackError.response && fallbackError.response.status === 401) {
          throw new Error('Username atau password salah');
        }
        throw fallbackError;
      }
    }
  } catch (error: any) {
    console.error('Login failed:', error);
    // If the error has a response, use the error message from the server
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    // Otherwise use the error message or a default
    throw error;
  }
};

// Fungsi untuk daftar pengguna baru
export const register = async (data: RegisterRequest): Promise<User> => {
  try {
    // Coba register menggunakan backend
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (backendError) {
      console.warn('Backend register failed, falling back to API route:', backendError);
      
      // Jika backend gagal, gunakan API route lokal sebagai fallback
      const fallbackResponse = await axios.post('/api/auth/register', data);
      return fallbackResponse.data;
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Fungsi untuk logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

// Fungsi untuk mendapatkan user yang sedang login
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
};

// Fungsi untuk mengecek apakah user sudah login
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Fungsi untuk mengecek apakah token masih valid
export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Coba validasi menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (backendError) {
      console.warn('Backend token validation failed, falling back to API route:', backendError);
      
      // Jika backend gagal, gunakan API route lokal sebagai fallback
      const fallbackResponse = await axios.get('/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return fallbackResponse.status === 200 && fallbackResponse.data.success === true;
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    logout(); // Logout jika token tidak valid
    return false;
  }
};

// Setup interceptor untuk menambahkan token ke semua request
export const setupAxiosInterceptors = (): void => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Interceptor untuk handle 401 response (unauthorized)
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}; 