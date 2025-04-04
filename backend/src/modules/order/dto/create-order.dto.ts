import { IsString, IsUUID, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { PaymentMethod } from '../../payment/entities/payment.entity';

export class OrderItemDto {
  @IsUUID()
  @ApiProperty({ description: 'Service ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  serviceId: string;

  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Quantity (for piece-based) or 1 for weight-based items', example: 2 })
  quantity: number;
  
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Weight in kg (for weight-based items)', example: 0.5, required: false })
  weight?: number;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Price per unit', example: 15000, required: false })
  price?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Service name', example: 'Regular Wash', required: false })
  serviceName?: string;
  
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Whether this item is weight-based pricing', example: true, required: false })
  weightBased?: boolean;
}

export class PaymentInfoDto {
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Payment amount', example: 100000 })
  amount: number;

  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Change amount', example: 50000 })
  change: number;

  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', example: PaymentMethod.CASH })
  method: PaymentMethod;
  
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reference number for the payment', example: 'REF-12345', required: false })
  referenceNumber?: string;
}

export class CreateOrderDto {
  @IsUUID()
  @ApiProperty({ description: 'Customer ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  customerId: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  @ApiProperty({ enum: OrderStatus, description: 'Order status', default: OrderStatus.NEW, required: false })
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Notes for the order', required: false })
  notes?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Special requirements for the order', required: false })
  specialRequirements?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Total amount for the order', required: false })
  totalAmount?: number;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Total amount for the order (alternative)', required: false })
  total?: number;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @ApiProperty({ description: 'Total weight of the laundry', required: false })
  totalWeight?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ description: 'Pickup date', required: false })
  pickupDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ description: 'Delivery date', required: false })
  deliveryDate?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Whether delivery is needed or customer will pick up', default: false, required: false })
  isDeliveryNeeded?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
  items: OrderItemDto[];
  
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  @ApiProperty({ type: PaymentInfoDto, description: 'Payment information', required: false })
  payment?: PaymentInfoDto;
} 