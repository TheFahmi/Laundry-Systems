// Payment method enum
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'bank_transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Frontend payment model (camelCase)
export interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Fields that might be added from order context
  orderId?: string;
  orderNumber?: string;
  orderStatus?: string;
}

export interface PaymentResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentFilter {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  totalAmount: number;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: string;
  notes?: string;
  orderId?: string;
}

export interface UpdatePaymentRequest {
  status?: string;
  transactionId?: string;
  notes?: string;
}

// Constants for payment status and methods
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DIGITAL_WALLET: 'digital_wallet'
};

// Utility to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper functions for payment data
export function getPaymentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case PAYMENT_STATUS.COMPLETED:
      return 'success';
    case PAYMENT_STATUS.PENDING:
      return 'warning';
    case PAYMENT_STATUS.CANCELLED:
      return 'error';
    case PAYMENT_STATUS.REFUNDED:
      return 'info';
    default:
      return 'default';
  }
}

export function getPaymentMethodIcon(method: string): string {
  switch (method.toLowerCase()) {
    case PAYMENT_METHODS.CASH:
      return 'cash';
    case PAYMENT_METHODS.BANK_TRANSFER:
      return 'bank';
    case PAYMENT_METHODS.CREDIT_CARD:
      return 'credit_card';
    case PAYMENT_METHODS.DIGITAL_WALLET:
      return 'wallet';
    default:
      return 'payment';
  }
}

// Backend payment model (snake_case)
export interface BackendPayment {
  id: string;
  order_id: string;
  orderId?: string;
  customer_id?: string;
  customerId?: string;
  amount: number;
  payment_method: string;
  paymentMethod?: string;
  payment_status: string;
  status?: string;
  transaction_id?: string;
  transactionId?: string;
  reference_number: string;
  referenceNumber?: string;
  notes?: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

// Convert from backend to frontend format
export function convertToFrontendPayment(backendPayment: BackendPayment): Payment {
  return {
    id: backendPayment.id,
    orderId: backendPayment.orderId || backendPayment.order_id || '',
    customerId: backendPayment.customerId || backendPayment.customer_id || '',
    amount: Number(backendPayment.amount) || 0,
    paymentMethod: (backendPayment.paymentMethod || backendPayment.payment_method || 'cash') as PaymentMethod,
    status: (backendPayment.status || backendPayment.payment_status || 'pending') as PaymentStatus,
    transactionId: backendPayment.transactionId || backendPayment.transaction_id || '',
    referenceNumber: backendPayment.referenceNumber || backendPayment.reference_number || '',
    notes: backendPayment.notes || '',
    createdAt: backendPayment.createdAt || backendPayment.created_at || new Date().toISOString(),
    updatedAt: backendPayment.updatedAt || backendPayment.updated_at || new Date().toISOString(),
    // Keep original snake_case properties
    order_id: backendPayment.order_id || backendPayment.orderId || '',
    customer_id: backendPayment.customer_id || backendPayment.customerId || '',
    payment_method: (backendPayment.payment_method || backendPayment.paymentMethod || 'cash') as PaymentMethod,
    payment_status: (backendPayment.payment_status || backendPayment.status || 'pending') as PaymentStatus,
    transaction_id: backendPayment.transaction_id || backendPayment.transactionId || '',
    reference_number: backendPayment.reference_number || backendPayment.referenceNumber || '',
    created_at: backendPayment.created_at || backendPayment.createdAt || new Date().toISOString(),
    updated_at: backendPayment.updated_at || backendPayment.updatedAt || new Date().toISOString(),
  };
}

// Convert from frontend to backend format
export function convertToBackendPayment(frontendPayment: Partial<Payment>): Partial<BackendPayment> {
  const result: Partial<BackendPayment> = {};
  
  if (frontendPayment.id !== undefined) result.id = frontendPayment.id;
  if (frontendPayment.orderId !== undefined) result.order_id = frontendPayment.orderId;
  if (frontendPayment.customerId !== undefined) result.customer_id = frontendPayment.customerId;
  if (frontendPayment.amount !== undefined) result.amount = frontendPayment.amount;
  if (frontendPayment.paymentMethod !== undefined) result.payment_method = frontendPayment.paymentMethod;
  if (frontendPayment.status !== undefined) result.status = frontendPayment.status;
  if (frontendPayment.transactionId !== undefined) result.transaction_id = frontendPayment.transactionId;
  if (frontendPayment.referenceNumber !== undefined) result.reference_number = frontendPayment.referenceNumber;
  if (frontendPayment.notes !== undefined) result.notes = frontendPayment.notes;
  
  return result;
}

// Localized payment method labels
export const methodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Tunai',
  [PaymentMethod.CREDIT_CARD]: 'Kartu Kredit',
  [PaymentMethod.DEBIT_CARD]: 'Kartu Debit',
  [PaymentMethod.TRANSFER]: 'Transfer Bank',
  [PaymentMethod.EWALLET]: 'E-Wallet',
  [PaymentMethod.OTHER]: 'Lainnya'
};

// Localized payment status labels
export const statusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Menunggu',
  [PaymentStatus.COMPLETED]: 'Selesai',
  [PaymentStatus.FAILED]: 'Gagal',
  [PaymentStatus.REFUNDED]: 'Dikembalikan',
  [PaymentStatus.CANCELLED]: 'Dibatalkan'
};

// Status colors for UI components
export const statusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'yellow',
  [PaymentStatus.COMPLETED]: 'green',
  [PaymentStatus.FAILED]: 'red',
  [PaymentStatus.REFUNDED]: 'blue',
  [PaymentStatus.CANCELLED]: 'gray'
}; 