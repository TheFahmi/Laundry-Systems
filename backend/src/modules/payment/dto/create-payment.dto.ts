import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID Pesanan terkait' })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ 
    description: 'Metode pembayaran', 
    enum: PaymentMethod,
    default: PaymentMethod.CASH
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ 
    description: 'Status pembayaran', 
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ description: 'Jumlah pembayaran' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'ID Transaksi (dari gateway pembayaran)', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ description: 'Catatan pembayaran', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Nomor Referensi', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
} 