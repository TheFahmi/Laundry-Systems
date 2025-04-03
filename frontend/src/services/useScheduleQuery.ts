import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduleService, ScheduleDate, TimeSlot, ScheduleRequest } from '@/services/schedule.service';

// Prefixes for query keys
const SCHEDULE_KEYS = {
  all: ['schedule'],
  availableDates: (startDate: string, endDate?: string) => 
    [...SCHEDULE_KEYS.all, 'availableDates', startDate, endDate || ''],
  timeSlots: (date: string) => 
    [...SCHEDULE_KEYS.all, 'timeSlots', date],
  deliveryDates: (pickupDate: string) => 
    [...SCHEDULE_KEYS.all, 'deliveryDates', pickupDate],
};

/**
 * Hook for fetching available dates for scheduling
 */
export function useAvailableDates(startDate: string, endDate?: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.availableDates(startDate, endDate),
    queryFn: () => {
      // Use the optional chaining to handle undefined endDate
      return ScheduleService.getAvailableDates(startDate, endDate ?? '');
    },
    enabled: !!startDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching available time slots for a specific date
 */
export function useTimeSlots(date: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.timeSlots(date),
    queryFn: () => ScheduleService.getTimeSlots(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching available delivery dates based on pickup date
 */
export function useDeliveryDates(pickupDate: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.deliveryDates(pickupDate),
    queryFn: () => ScheduleService.calculateDeliveryDates(pickupDate),
    enabled: !!pickupDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for creating a new schedule with optimistic UI updates
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scheduleData: ScheduleRequest) => 
      ScheduleService.createSchedule(scheduleData),
    
    // On success, invalidate affected queries
    onSuccess: (data, variables) => {
      // Invalidate available dates since we've now booked a slot
      queryClient.invalidateQueries({ 
        queryKey: SCHEDULE_KEYS.availableDates(variables.pickupDate) 
      });
      
      // Invalidate time slots for the pickup date
      queryClient.invalidateQueries({ 
        queryKey: SCHEDULE_KEYS.timeSlots(variables.pickupDate) 
      });
      
      // Invalidate time slots for the delivery date
      queryClient.invalidateQueries({ 
        queryKey: SCHEDULE_KEYS.timeSlots(variables.deliveryDate) 
      });
      
      // Also invalidate orders list as a new order might be created
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
} 