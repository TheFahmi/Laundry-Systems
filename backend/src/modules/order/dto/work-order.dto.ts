import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsDate, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WorkOrderStatus, WorkOrderStepType } from '../entities/work-order.entity';
import { WorkOrderStepStatus } from '../entities/work-order-step.entity';

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'The order ID to create a work order for' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'The job queue ID (optional)' })
  @IsOptional()
  @IsUUID()
  jobQueueId?: string;

  @ApiProperty({ description: 'Staff member assigned to this work order' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Priority level (1-5, where 1 is highest)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  priority?: number;

  @ApiProperty({ description: 'Special handling instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Notes or comments' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkOrderDto {
  @ApiProperty({ description: 'Status of the work order' })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiProperty({ description: 'Staff member assigned to this work order' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Priority level (1-5, where 1 is highest)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  priority?: number;

  @ApiProperty({ description: 'Start date and time of work' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: 'End date and time of work' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ description: 'Current processing step' })
  @IsOptional()
  @IsEnum(WorkOrderStepType)
  currentStep?: WorkOrderStepType;

  @ApiProperty({ description: 'Special handling instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Notes or comments' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkOrderStepDto {
  @ApiProperty({ description: 'The work order ID' })
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  @ApiProperty({ description: 'Type of step in the work order process' })
  @IsNotEmpty()
  @IsEnum(WorkOrderStepType)
  stepType: WorkOrderStepType;

  @ApiProperty({ description: 'The step number in sequence' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  sequenceNumber: number;

  @ApiProperty({ description: 'Staff assigned to this step' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Notes or comments for this step' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkOrderStepDto {
  @ApiProperty({ description: 'The status of this step' })
  @IsOptional()
  @IsEnum(WorkOrderStepStatus)
  status?: WorkOrderStepStatus;

  @ApiProperty({ description: 'Staff assigned to this step' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Start time of this step' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: 'End time of this step' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationMinutes?: number;

  @ApiProperty({ description: 'Notes or comments for this step' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class WorkOrderQueryDto {
  @ApiProperty({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiProperty({ description: 'Filter by order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'Filter by job queue ID' })
  @IsOptional()
  @IsUUID()
  jobQueueId?: string;

  @ApiProperty({ description: 'Filter by assigned staff member' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Filter by date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;
} 