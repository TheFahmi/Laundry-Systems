import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Order ID for the payment', example: 'f9f2a97d-e9db-4a76-9aa1-ed74e2acef79' })
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Payment amount', example: 99.99 })
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  @ApiProperty({ 
    enum: PaymentMethod, 
    description: 'Payment method',
    example: PaymentMethod.CREDIT_CARD
  })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ 
    enum: PaymentStatus, 
    description: 'Payment status',
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING
  })
  status?: PaymentStatus = PaymentStatus.PENDING;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Transaction ID from payment provider', required: false })
  transactionId?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Reference number for the payment', example: 'PAY-1743323773' })
  referenceNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Notes about the payment', required: false })
  notes?: string;
} 