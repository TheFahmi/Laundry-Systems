// Application configuration

export const APP_NAME = 'Laundry Management System';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// Currency formatter
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Date formatter
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

// Time formatter
export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(date));
};

// DateTime formatter
export const formatDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(date));
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// App Config
export const APP_VERSION = '1.0.0';

// Format options
export const DATE_FORMAT = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'dd MMM yyyy HH:mm';
export const CURRENCY_FORMAT = 'IDR'; 