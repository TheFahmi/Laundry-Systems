import axios from 'axios';
import { API_URL } from '@/config';
import Cookies from 'js-cookie';

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
      
      // Simpan token di cookie
      if (response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: 1, // 1 day
          path: '/',
          sameSite: 'strict'
        });
        
        // Simpan user data di localStorage untuk kemudahan akses
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
        
        // Simpan token di cookie
        if (fallbackResponse.data.token) {
          Cookies.set('token', fallbackResponse.data.token, { 
            expires: 1, // 1 day
            path: '/',
            sameSite: 'strict'
          });
          
          // Simpan user data di localStorage untuk kemudahan akses
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
export const register = async (data: RegisterRequest | string, password?: string, email?: string, name?: string): Promise<User> => {
  try {
    let registerData: RegisterRequest;
    
    // Check if first parameter is string (username) or RegisterRequest object
    if (typeof data === 'string' && password && email && name) {
      console.log('Using separate parameters for registration');
      registerData = {
        username: data,
        password,
        email,
        name
      };
    } else if (typeof data === 'object') {
      console.log('Using data object for registration');
      registerData = data as RegisterRequest;
    } else {
      throw new Error('Invalid registration parameters');
    }
    
    console.log('Registration data before validation:', registerData);
    
    // Validate input data before sending to server
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.name) {
      console.error('Missing required fields:', { 
        username: !!registerData.username, 
        email: !!registerData.email, 
        password: !!registerData.password, 
        name: !!registerData.name 
      });
      throw new Error('Semua field harus diisi: username, email, password, dan nama');
    }

    // Additional validation
    if (registerData.password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      throw new Error('Format email tidak valid');
    }

    // Ensure no null values are sent to the server by removing them
    const cleanData = Object.entries(registerData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>) as RegisterRequest;
    
    console.log('Clean data for registration:', cleanData);
    
    // Coba register menggunakan backend
    try {
      const response = await axios.post(`${API_URL}/auth/register`, cleanData);
      console.log('Backend registration successful:', response.data);
      return response.data;
    } catch (backendError: any) {
      console.warn('Backend register failed, falling back to API route:', backendError);
      
      // Handle server validation errors
      if (backendError.response && backendError.response.data && backendError.response.data.message) {
        throw new Error(backendError.response.data.message);
      }
      
      // Jika backend gagal, gunakan API route lokal sebagai fallback
      console.log('Trying fallback registration via API route');
      const fallbackResponse = await axios.post('/api/auth/register', cleanData);
      console.log('Fallback registration successful:', fallbackResponse.data);
      return fallbackResponse.data;
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    // If it's already an Error object, just throw it
    if (error instanceof Error) {
      throw error;
    }
    // If it has a response with a message
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    // Default error
    throw new Error('Pendaftaran gagal. Silakan coba lagi.');
  }
};

// Fungsi untuk logout
export const logout = (): void => {
  // Hapus token dari cookie
  Cookies.remove('token');
  
  // Hapus user data dari localStorage
  localStorage.removeItem('user');
  
  // Hapus Authorization header
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
  return !!Cookies.get('token');
};

// Fungsi untuk mengecek apakah token masih valid
export const validateToken = async (): Promise<boolean> => {
  const token = Cookies.get('token');
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
  const token = Cookies.get('token');
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

// Function to get the token with fallback to localStorage
export const getToken = (): string | null => {
  try {
    // Try to get token from cookies first
    const cookieToken = Cookies.get('token');
    if (cookieToken) {
      return cookieToken;
    }
    
    // Fall back to localStorage if cookie not available
    const backupToken = localStorage.getItem('token_backup');
    if (backupToken) {
      // Restore cookie from localStorage backup
      Cookies.set('token', backupToken, { 
        expires: 1, // 1 day
        path: '/', 
        sameSite: 'strict',
        secure: window.location.protocol === 'https:'
      });
      console.log('Restored token from localStorage backup');
      return backupToken;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}; 