import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  orderId?: string;
} 