import { createAuthHeaders } from '@/lib/api-utils';
import { WorkOrder, WorkOrderStatus } from '@/types/work-order';

// Helper for API URL
const getApiUrl = () => '/api';

/**
 * Get work orders with optional date and status filter
 * @param date - Date to filter work orders (YYYY-MM-DD format)
 * @param status - Optional status filter
 * @returns Promise resolving to an array of work orders
 */
export async function getWorkOrders(date?: string, status?: string | null): Promise<WorkOrder[]> {
  try {
    let url = `${getApiUrl()}/work-order`;
    const params: Record<string, string> = {};
    
    if (date) params.date = date;
    if (status) params.status = status;
    
    const queryString = new URLSearchParams(params).toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await fetch(url, {
      headers: createAuthHeaders()
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
    console.warn('Unexpected work order API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
}

/**
 * Get a specific work order by ID
 * @param id - Work order ID
 * @returns Promise resolving to a work order
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order/${id}`, {
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching work order with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new work order
 * @param workOrderData - Work order data
 * @returns Promise resolving to the created work order
 */
export async function createWorkOrder(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders()
      },
      body: JSON.stringify(workOrderData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
}

/**
 * Update an existing work order
 * @param id - Work order ID 
 * @param workOrderData - Updated work order data
 * @returns Promise resolving to the updated work order
 */
export async function updateWorkOrder(id: string, workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders()
      },
      body: JSON.stringify(workOrderData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating work order with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a work order
 * @param id - Work order ID to delete
 * @returns Promise resolving to void
 */
export async function deleteWorkOrder(id: string): Promise<void> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting work order with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create work orders from orders with a specific status
 * @param status - Order status to filter by (e.g. NEW, PROCESSING)
 * @returns Promise resolving to an array of created work orders
 */
export async function createWorkOrdersFromOrderStatus(status: string): Promise<WorkOrder[]> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order/from-orders/${status}`, {
      method: 'POST',
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error creating work orders from orders with status ${status}:`, error);
    throw error;
  }
}

/**
 * Create a work order from a job queue item
 * @param jobQueueId - Job queue ID
 * @returns Promise resolving to the created work order
 */
export async function createWorkOrderFromJobQueue(jobQueueId: string): Promise<WorkOrder[]> {
  try {
    const response = await fetch(`${getApiUrl()}/work-order/from-job-queue/${jobQueueId}`, {
      method: 'POST',
      headers: createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error creating work order from job queue with ID ${jobQueueId}:`, error);
    throw error;
  }
} 