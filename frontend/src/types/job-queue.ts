export interface JobQueueItem {
  id: string;
  orderId: string;
  scheduledDate: string;
  queuePosition: number;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    status: string;
    totalWeight: number;
    totalAmount: number;
    customer?: {
      name: string;
      phone?: string;
    };
  };
}

export interface CreateJobQueueDto {
  orderId: string;
  scheduledDate: string;
  queuePosition?: number;
  estimatedCompletionTime?: string;
  notes?: string;
}

export interface UpdateJobQueueDto {
  queuePosition?: number;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  notes?: string;
}

export interface JobQueuePrintItem {
  queuePosition: number;
  orderNumber: string;
  customerName: string;
  status: string;
  totalItems: number;
  totalWeight: number;
  estimatedCompletionTime: string;
  actualCompletionTime: string;
  notes?: string;
} 