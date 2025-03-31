import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum CalendarEventType {
  ORDER = 'order',
  PAYMENT = 'payment',
  WORK_ORDER = 'work-order',
  DELIVERY = 'delivery',
}

export class CalendarQueryDto {
  @ApiProperty({
    description: 'Start date for filtering events',
    example: '2024-03-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering events',
    example: '2024-03-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Type of event to filter by',
    enum: CalendarEventType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CalendarEventType)
  type?: CalendarEventType;
}

export class CalendarEventDto {
  @ApiProperty({
    description: 'Unique identifier of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Order #ORD-20240301-12345',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Date of the event in ISO format',
    example: '2024-03-15T10:00:00Z',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Type of event',
    enum: CalendarEventType,
    example: CalendarEventType.ORDER,
  })
  @IsEnum(CalendarEventType)
  type: CalendarEventType;

  @ApiProperty({
    description: 'Status of the event (depends on the event type)',
    example: 'processing',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Monetary amount (for payment events)',
    example: 150000,
    required: false,
  })
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Related entity ID (order ID, payment ID, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({
    description: 'Additional data for the event',
    example: { customerName: 'John Doe', items: 3 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
} 