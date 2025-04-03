import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerService, CustomerProfile, CustomerStats, CustomerAddress } from '@/services/customer.service';

// Prefixes for query keys
const CUSTOMER_KEYS = {
  profile: ['customer', 'profile'],
  stats: ['customer', 'stats'],
  addresses: ['customer', 'addresses'],
};

/**
 * Hook for fetching customer profile
 */
export function useCustomerProfile() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.profile,
    queryFn: () => CustomerService.getProfile(),
  });
}

/**
 * Hook for updating customer profile with optimistic updates
 */
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: Partial<CustomerProfile>) => 
      CustomerService.updateProfile(profileData),
    
    // When mutate is called:
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CUSTOMER_KEYS.profile });
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<CustomerProfile>(CUSTOMER_KEYS.profile);
      
      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<CustomerProfile>(CUSTOMER_KEYS.profile, {
          ...previousProfile,
          ...newProfileData,
        });
      }
      
      // Return a context object with the snapshot value
      return { previousProfile };
    },
    
    // If the mutation fails, use the context we returned above
    onError: (err, newProfileData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(CUSTOMER_KEYS.profile, context.previousProfile);
      }
    },
    
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.profile });
    },
  });
}

/**
 * Hook for fetching customer dashboard stats
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.stats,
    queryFn: () => CustomerService.getDashboardStats(),
  });
}

/**
 * Hook for fetching customer addresses
 */
export function useCustomerAddresses() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.addresses,
    queryFn: () => CustomerService.getAddresses(),
  });
}

/**
 * Hook for adding a new customer address with optimistic updates
 */
export function useAddCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: Omit<CustomerAddress, 'id'>) => 
      CustomerService.addAddress(address),
    
    // When mutate is called:
    onMutate: async (newAddress) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CUSTOMER_KEYS.addresses });
      
      // Snapshot the previous value
      const previousAddresses = queryClient.getQueryData<CustomerAddress[]>(CUSTOMER_KEYS.addresses);
      
      // Optimistically update to the new value
      if (previousAddresses) {
        // Create a temporary ID for the optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticAddress: CustomerAddress = {
          id: tempId,
          ...newAddress,
          isDefault: newAddress.isDefault || false,
        };
        
        queryClient.setQueryData<CustomerAddress[]>(
          CUSTOMER_KEYS.addresses,
          [...previousAddresses, optimisticAddress]
        );
      }
      
      // Return a context with the snapshot
      return { previousAddresses };
    },
    
    // If the mutation fails, roll back
    onError: (err, newAddress, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(CUSTOMER_KEYS.addresses, context.previousAddresses);
      }
    },
    
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses });
    },
  });
}

/**
 * Hook for updating a customer address with optimistic updates
 */
export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<CustomerAddress> }) => 
      CustomerService.updateAddress(id, address),
    
    // When mutate is called:
    onMutate: async ({ id, address }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CUSTOMER_KEYS.addresses });
      
      // Snapshot the previous addresses
      const previousAddresses = queryClient.getQueryData<CustomerAddress[]>(CUSTOMER_KEYS.addresses);
      
      // Optimistically update
      if (previousAddresses) {
        const updatedAddresses = previousAddresses.map(addr => 
          addr.id === id ? { ...addr, ...address } : addr
        );
        
        queryClient.setQueryData<CustomerAddress[]>(
          CUSTOMER_KEYS.addresses,
          updatedAddresses
        );
      }
      
      return { previousAddresses };
    },
    
    // On error, roll back
    onError: (err, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(CUSTOMER_KEYS.addresses, context.previousAddresses);
      }
    },
    
    // Refetch to ensure syncing with server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses });
    },
  });
}

/**
 * Hook for deleting a customer address with optimistic updates
 */
export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => CustomerService.deleteAddress(id),
    
    // When mutate is called:
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CUSTOMER_KEYS.addresses });
      
      // Snapshot current state
      const previousAddresses = queryClient.getQueryData<CustomerAddress[]>(CUSTOMER_KEYS.addresses);
      
      // Optimistically remove the address
      if (previousAddresses) {
        const updatedAddresses = previousAddresses.filter(addr => addr.id !== id);
        
        queryClient.setQueryData<CustomerAddress[]>(
          CUSTOMER_KEYS.addresses,
          updatedAddresses
        );
      }
      
      return { previousAddresses };
    },
    
    // On error, restore previous state
    onError: (err, id, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(CUSTOMER_KEYS.addresses, context.previousAddresses);
      }
    },
    
    // Refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses });
    },
  });
}

/**
 * Hook for changing customer password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      CustomerService.changePassword(currentPassword, newPassword),
  });
} 