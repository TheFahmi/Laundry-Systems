import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Memperluas tipe Session.User default dari next-auth
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

/**
 * Custom hook untuk mengelola otentikasi pengguna
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth; 