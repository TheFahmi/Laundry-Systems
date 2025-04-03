import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ description: 'ID Pembayaran' })
  id: string;

  @ApiProperty({ description: 'ID Pesanan terkait' })
  orderId: string;
  
  @ApiProperty({ description: 'Nomor Pesanan', required: false })
  orderNumber?: string;

  @ApiProperty({ description: 'ID Pelanggan', required: false })
  customerId?: string;

  @ApiProperty({ description: 'Nama Pelanggan', required: false })
  customerName?: string;

  @ApiProperty({ description: 'Metode pembayaran', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Status pembayaran', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Jumlah pembayaran' })
  amount: number;
  
  @ApiProperty({ description: 'Nomor Referensi Pembayaran' })
  referenceNumber: string;

  @ApiProperty({ description: 'ID Transaksi (dari gateway pembayaran)', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Catatan pembayaran', required: false })
  notes?: string;

  @ApiProperty({ description: 'Tanggal dibuat' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diperbarui' })
  updatedAt: Date;
  
  @ApiProperty({ description: 'Data pesanan terkait', required: false })
  order?: any;
} 