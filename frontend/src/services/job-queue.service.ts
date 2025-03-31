import { apiClient } from '@/lib/api-client';
import { JobQueueItem, CreateJobQueueDto, UpdateJobQueueDto, JobQueuePrintItem } from '@/types/job-queue';

const BASE_URL = '/job-queue';

export const jobQueueService = {
  getByDate: async (date: string): Promise<JobQueueItem[]> => {
    const response = await apiClient.get(`${BASE_URL}?date=${date}`);
    return response.data;
  },

  getById: async (id: string): Promise<JobQueueItem> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data: CreateJobQueueDto): Promise<JobQueueItem> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  update: async (id: string, data: UpdateJobQueueDto): Promise<JobQueueItem> => {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  getPrintData: async (date: string, status?: string): Promise<JobQueuePrintItem[]> => {
    const url = status 
      ? `${BASE_URL}/print/daily?date=${date}&status=${status}`
      : `${BASE_URL}/print/daily?date=${date}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }
}; 