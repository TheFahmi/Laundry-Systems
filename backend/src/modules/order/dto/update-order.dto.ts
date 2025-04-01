import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto, OrderItemDto } from './create-order.dto';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsDate, ValidateNested, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus)
  @ApiProperty({ enum: OrderStatus, description: 'Order status', required: false })
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
  @IsNumber()
  @ApiProperty({ description: 'Total amount for the order', required: false })
  totalAmount?: number;

  @IsOptional()
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
  @ApiProperty({ description: 'Whether delivery is needed or customer will pick up', required: false })
  isDeliveryNeeded?: boolean;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'Customer ID', required: false })
  customerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto], description: 'Order items', required: false })
  items?: OrderItemDto[];
} 