export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum WorkOrderStepType {
  SORTING = 'SORTING',
  WASHING = 'WASHING',
  DRYING = 'DRYING',
  FOLDING = 'FOLDING',
  PACKAGING = 'PACKAGING',
  QUALITY_CHECK = 'QUALITY_CHECK'
}

export enum WorkOrderStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface WorkOrderStep {
  id: string;
  workOrderId: string;
  stepType: WorkOrderStepType;
  sequenceNumber: number;
  status: WorkOrderStepStatus;
  assignedTo?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  jobQueueId?: string;
  workOrderNumber?: string;
  status: WorkOrderStatus;
  assignedTo?: string;
  priority: number;
  startTime?: string;
  endTime?: string;
  instructions?: string;
  currentStep: WorkOrderStepType;
  notes?: string;
  steps?: WorkOrderStep[];
  createdAt: string;
  updatedAt: string;
} 