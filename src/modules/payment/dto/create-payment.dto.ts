import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNotEmpty()
  @IsString()
  orderId: string;
} 