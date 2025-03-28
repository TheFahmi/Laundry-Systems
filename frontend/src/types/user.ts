export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  status: boolean;
}

export interface EditUserFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  status: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
} 