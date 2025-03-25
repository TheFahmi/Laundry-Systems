import * as auth from '../api/auth';

// Re-export types
export type { 
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest 
} from '../api/auth';

// Export all auth functions through the service
export const authService = {
  login: auth.login,
  register: auth.register,
  logout: auth.logout,
  getCurrentUser: auth.getCurrentUser,
  isAuthenticated: auth.isAuthenticated,
  validateToken: auth.validateToken,
  setupAxiosInterceptors: auth.setupAxiosInterceptors
}; 