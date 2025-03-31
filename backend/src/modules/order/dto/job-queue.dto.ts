import { IsNotEmpty, IsUUID, IsOptional, IsString, IsNumber, IsDate, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJobQueueDto {
  @ApiProperty({ description: 'The order ID to add to the job queue' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'The date when this job is scheduled (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Queue position (optional, will be auto-assigned if not provided)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  queuePosition?: number;

  @ApiProperty({ description: 'Estimated completion time (optional)' })
  @IsOptional()
  @IsDateString()
  estimatedCompletionTime?: string;

  @ApiProperty({ description: 'Notes about the job queue entry' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateJobQueueDto {
  @ApiProperty({ description: 'Queue position' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  queuePosition?: number;

  @ApiProperty({ description: 'Estimated completion time' })
  @IsOptional()
  @IsDateString()
  estimatedCompletionTime?: string;

  @ApiProperty({ description: 'Actual completion time' })
  @IsOptional()
  @IsDateString()
  actualCompletionTime?: string;

  @ApiProperty({ description: 'Notes about the job queue entry' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DailyJobQueueQueryDto {
  @ApiProperty({ description: 'The date to query job queue items (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}

export class PrintJobQueueDto {
  @ApiProperty({ description: 'The date to print job queue (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;
  
  @ApiProperty({ description: 'Include only certain status (optional)' })
  @IsOptional()
  @IsString()
  status?: string;
} 