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
  orderId: string;
  customerId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Allow snake_case properties for API response
  order_id?: string;
  customer_id?: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  reference_number?: string;
  created_at?: string;
  updated_at?: string;
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