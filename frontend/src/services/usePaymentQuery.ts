import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerPaymentService, Payment, PaymentFilters, PaymentFilter, PaymentResponse } from './customerPayment.service';
import { getCustomerPayments, getPaymentDetails } from './customerPayment.service';

// Prefixes for query keys
const PAYMENT_KEYS = {
  all: ['payments'],
  lists: () => [...PAYMENT_KEYS.all, 'list'],
  list: (filters: any) => [...PAYMENT_KEYS.lists(), filters],
  details: () => [...PAYMENT_KEYS.all, 'detail'],
  detail: (id: string) => [...PAYMENT_KEYS.details(), id],
};

interface UseCustomerPaymentsProps {
  initialPage?: number;
  initialLimit?: number;
  initialFilter?: PaymentFilter;
  autoFetch?: boolean;
}

/**
 * Hook for fetching customer payments
 */
export function useCustomerPayments({
  initialPage = 1,
  initialLimit = 10,
  initialFilter,
  autoFetch = true
}: UseCustomerPaymentsProps = {}) {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [filter, setFilter] = useState<PaymentFilter | undefined>(initialFilter);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentsResponse, setPaymentsResponse] = useState<PaymentResponse>({
    items: [],
    total: 0,
    page: initialPage,
    limit: initialLimit
  });

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCustomerPayments({ page, limit, filter });
      setPaymentsResponse(response);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments. Please try again later.');
      // Keep previous data if available
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filter]);

  // Initial fetch if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [autoFetch, fetchPayments]);

  // Pagination and filter handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  }, []);

  const handleFilterChange = useCallback((newFilter: PaymentFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filter
  }, []);

  return {
    paymentsResponse,
    isLoading,
    error,
    page,
    limit,
    filter,
    fetchPayments,
    handlePageChange,
    handleLimitChange,
    handleFilterChange
  };
}

interface UsePaymentDetailsProps {
  id: string;
  autoFetch?: boolean;
}

/**
 * Hook for fetching payment details
 */
export function usePaymentDetails({ 
  id, 
  autoFetch = true 
}: UsePaymentDetailsProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentDetails = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const paymentData = await getPaymentDetails({ id });
      
      if (!paymentData) {
        setError('Payment not found');
        setPayment(null);
      } else {
        setPayment(paymentData);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError('Failed to fetch payment details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Initial fetch if autoFetch is true
  useEffect(() => {
    if (autoFetch && id) {
      fetchPaymentDetails();
    }
  }, [autoFetch, fetchPaymentDetails, id]);

  return {
    payment,
    isLoading,
    error,
    fetchPaymentDetails
  };
}

/**
 * Hook for making a payment
 */
export function useMakePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      orderId, 
      paymentMethod, 
      amount, 
      transactionId 
    }: { 
      orderId: string;
      paymentMethod: string;
      amount: number;
      transactionId?: string;
    }) => CustomerPaymentService.makePayment(
      orderId,
      paymentMethod,
      amount,
      transactionId
    ),
    
    // After success, invalidate the payments list and order details
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
      // Also invalidate the related order
      if (data.orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', 'detail', data.orderId] });
      }
    },
  });
} 