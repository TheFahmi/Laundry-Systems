import axios from 'axios';
import { JobQueueItem, CreateJobQueueDto, UpdateJobQueueDto, JobQueuePrintItem } from '@/types/job-queue';

const API_BASE_URL = '/api/job-queue';

/**
 * Get job queue items for a specific date
 * @param date - The date in YYYY-MM-DD format
 */
export const getJobQueueByDate = async (date: string): Promise<JobQueueItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}?date=${date}`);
    
    console.log('Raw job queue response:', response.data);
    
    // Handle different possible response formats
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // This matches the structure shown in the data sample
      return response.data.data;
    } else if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    } else {
      console.warn('Unexpected response format from job queue API:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching job queue items by date:', error);
    throw error;
  }
};

/**
 * Get job queue item by ID
 * @param id - Job queue item ID
 */
export const getJobQueueById = async (id: string): Promise<JobQueueItem> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job queue item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new job queue item
 * @param data - Job queue data to create
 */
export const createJobQueue = async (data: CreateJobQueueDto): Promise<JobQueueItem> => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating job queue item:', error);
    throw error;
  }
};

/**
 * Update an existing job queue item
 * @param id - Job queue item ID
 * @param data - Job queue data to update
 */
export const updateJobQueue = async (id: string, data: UpdateJobQueueDto): Promise<JobQueueItem> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating job queue item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a job queue item
 * @param id - Job queue item ID
 */
export const deleteJobQueue = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting job queue item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get job queue data formatted for printing
 * @param date - The date in YYYY-MM-DD format
 * @param status - Optional status filter
 */
export const getJobQueuePrintData = async (date: string, status?: string): Promise<JobQueuePrintItem[]> => {
  try {
    const url = status 
      ? `${API_BASE_URL}/print/daily?date=${date}&status=${status}`
      : `${API_BASE_URL}/print/daily?date=${date}`;
    
    const response = await axios.get(url);
    
    console.log('Raw job queue print response:', response.data);
    
    // Handle different possible response formats
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // This matches the structure shown in the data sample
      return response.data.data;
    } else if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    } else {
      console.warn('Unexpected response format from job queue print API:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching job queue print data:', error);
    throw error;
  }
}; 