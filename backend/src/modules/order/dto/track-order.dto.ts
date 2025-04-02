import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderDto {
  @ApiProperty({
    description: 'Order number in the format ORD-YYYYMMDD-XXXXX',
    example: 'ORD-20240516-12345'
  })
  @IsNotEmpty({ message: 'Order number is required' })
  @IsString({ message: 'Order number must be a string' })
  orderNumber: string;
}

export class TrackOrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '13c91496-2db4-4cce-bcba-bc3f7e37b08f'
  })
  id: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-20240516-12345'
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe'
  })
  customerName: string;

  @ApiProperty({
    description: 'Order status',
    example: 'processing'
  })
  status: string;

  @ApiProperty({
    description: 'Total amount',
    example: 150000
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Created date',
    example: '2024-05-16T12:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Expected delivery date',
    example: '2024-05-18T12:00:00.000Z'
  })
  deliveryDate: Date | null;

  @ApiProperty({
    description: 'Payment status',
    example: 'completed'
  })
  paymentStatus: string;
} 