import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, TrackOrderResponse } from '@/services/order.service';

// Prefixes for query keys
const ORDER_KEYS = {
  all: ['orders'],
  lists: () => [...ORDER_KEYS.all, 'list'],
  list: (filters: any) => [...ORDER_KEYS.lists(), filters],
  details: () => [...ORDER_KEYS.all, 'detail'],
  detail: (id: string) => [...ORDER_KEYS.details(), id],
  tracking: () => [...ORDER_KEYS.all, 'tracking'],
  trackOrder: (orderNumber: string) => [...ORDER_KEYS.tracking(), orderNumber],
};

/**
 * Hook for fetching paginated orders
 */
export function useOrders(page = 1, limit = 10, status?: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ORDER_KEYS.list({ page, limit, status }),
    queryFn: () => OrderService.getOrders(page, limit, status),
    placeholderData: () => {
      const lastPage = queryClient.getQueryData(
        ORDER_KEYS.list({ page: page - 1, limit, status })
      );
      return lastPage;
    },
  });
}

/**
 * Hook for fetching order details
 */
export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: () => OrderService.getOrderDetails(orderId),
    enabled: !!orderId, // Only fetch when orderId is provided
  });
}

/**
 * Hook for tracking an order
 */
export function useTrackOrder(orderNumber: string) {
  return useQuery({
    queryKey: ORDER_KEYS.trackOrder(orderNumber),
    queryFn: () => OrderService.trackOrder(orderNumber),
    enabled: !!orderNumber, // Only fetch when orderNumber is provided
    retry: 1, // Only retry once
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook for cancelling an order with optimistic updates
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const result = await OrderService.cancelOrder(orderId);
        return result;
      } catch (error: any) {
        // Transform the error to include any data from the response
        const enhancedError = new Error(
          error.message || 'Failed to cancel order'
        );
        (enhancedError as any).data = error.response?.data;
        throw enhancedError;
      }
    },
    
    // When mutate is called:
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ORDER_KEYS.detail(orderId) });
      
      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData(ORDER_KEYS.detail(orderId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(ORDER_KEYS.detail(orderId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: 'cancelled',
        };
      });
      
      // Return a context object with the snapshot
      return { previousOrder };
    },
    
    // If the mutation fails, roll back
    onError: (err, orderId, context) => {
      console.error('Error cancelling order:', err);
      // Restore the previous value of the order
      if (context?.previousOrder) {
        queryClient.setQueryData(ORDER_KEYS.detail(orderId), context.previousOrder);
      }
    },
    
    // After success or failure, invalidate related queries
    onSettled: (data, error, orderId) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
    },
  });
}

/**
 * Hook for creating a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => OrderService.createOrder(orderData),
    
    // After success, invalidate orders list
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
    },
  });
} 