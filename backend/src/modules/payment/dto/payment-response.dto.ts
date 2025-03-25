import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ description: 'ID Pembayaran' })
  id: string;

  @ApiProperty({ description: 'ID Pesanan terkait' })
  orderId: string;

  @ApiProperty({ description: 'Nama Pelanggan' })
  customerName: string;

  @ApiProperty({ description: 'Metode pembayaran', enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty({ description: 'Status pembayaran', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Jumlah pembayaran' })
  amount: number;

  @ApiProperty({ description: 'ID Transaksi (dari gateway pembayaran)' })
  transactionId: string;

  @ApiProperty({ description: 'Catatan pembayaran' })
  notes: string;

  @ApiProperty({ description: 'Tanggal dibuat' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diperbarui' })
  updatedAt: Date;
} 