import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus, description: 'Payment status', required: false })
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', required: false })
  method?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Payment amount', required: false })
  amount?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Transaction ID from payment provider', required: false })
  transactionId?: string;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reference number', required: false })
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Notes about the payment', required: false })
  notes?: string;
} 