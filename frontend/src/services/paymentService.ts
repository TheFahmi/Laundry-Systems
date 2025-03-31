import { 
  Payment, 
  BackendPayment, 
  convertToFrontendPayment, 
  convertToBackendPayment,
  PaymentMethod,
  PaymentStatus
} from '@/types/payment';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  search?: string;
  orderId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentListData {
  data: BackendPayment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentListResponse {
  data: PaymentListData;
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface PaymentResponse {
  data: BackendPayment;
  statusCode: number;
  message: string;
  timestamp: string;
}

// Get payments with filtering and pagination
export async function getPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
  const queryParams = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/payments?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch payments: ${response.status}`);
  }
  
  return await response.json();
}

// Get a single payment by ID
export async function getPayment(id: string): Promise<Payment> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch payment: ${response.status}`);
  }
  
  const responseData = await response.json();
  
  // Handle different response structures
  let paymentData;
  if (responseData.data) {
    paymentData = responseData.data;
  } else {
    paymentData = responseData;
  }
  
  // Manually normalize the payment data to ensure all needed fields are present
  // This handles both camelCase and snake_case properties
  const normalizedPayment: Payment = {
    id: paymentData.id,
    orderId: paymentData.orderId || paymentData.order_id || '',
    customerId: paymentData.customerId || paymentData.customer_id || '',
    amount: Number(paymentData.amount) || 0,
    paymentMethod: (paymentData.paymentMethod || paymentData.payment_method || paymentData.method || 'cash') as PaymentMethod,
    status: (paymentData.status || paymentData.payment_status || 'pending') as PaymentStatus,
    transactionId: paymentData.transactionId || paymentData.transaction_id || '',
    referenceNumber: paymentData.referenceNumber || paymentData.reference_number || '',
    notes: paymentData.notes || '',
    createdAt: paymentData.created_at || new Date().toISOString(),
    updatedAt: paymentData.updated_at || new Date().toISOString(),
  };
  
  return normalizedPayment;
}

// Create a new payment
export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const backendPayment = convertToBackendPayment(payment);
  
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendPayment),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to create payment: ${response.status}`);
  }
  
  const data = await response.json();
  return convertToFrontendPayment(data);
}

// Update an existing payment
export async function updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
  const backendPayment = convertToBackendPayment(payment);
  
  const response = await fetch(`/api/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendPayment),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to update payment: ${response.status}`);
  }
  
  const data = await response.json();
  return convertToFrontendPayment(data);
}

// Delete a payment
export async function deletePayment(id: string): Promise<void> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to delete payment: ${response.status}`);
  }
} 