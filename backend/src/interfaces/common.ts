// Common interfaces used across modules

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  message?: string; // Optional message field for empty state or notifications
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}

export interface SuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
} 