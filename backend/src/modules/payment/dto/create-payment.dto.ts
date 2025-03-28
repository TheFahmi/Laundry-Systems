import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'Order ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  orderId: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'Customer ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  customerId?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Payment amount', example: 150000 })
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', example: PaymentMethod.CASH })
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus, description: 'Payment status', example: PaymentStatus.PENDING, default: PaymentStatus.PENDING, required: false })
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Transaction ID from payment provider', example: 'TRX-123456', required: false })
  transactionId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reference number', example: 'REF-123456', required: false })
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Notes about the payment', required: false })
  notes?: string;
} 