import { createAuthHeaders } from '@/lib/api-utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'order' | 'payment' | 'work-order' | 'delivery';
  status?: string;
  amount?: number;
  entityId?: string;
  metadata?: Record<string, any>;
}

export interface CalendarQueryParams {
  startDate?: string;
  endDate?: string;
  type?: 'order' | 'payment' | 'work-order' | 'delivery';
}

/**
 * Get calendar events filtered by date range and type
 * @param params Query parameters for filtering events
 * @returns Promise resolving to an array of calendar events
 */
export async function getCalendarEvents(params: CalendarQueryParams = {}): Promise<CalendarEvent[]> {
  try {
    const { startDate, endDate, type } = params;
    
    // Build URL with query parameters
    let url = '/api/calendar/events';
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);
    
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    
    // Make the API request
    const response = await fetch(url, {
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    }
    
    // If we can't determine the format, log warning and return empty array
    console.warn('Unexpected calendar API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
} 