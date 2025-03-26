import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { OrderStatus } from '../../../models/order.entity';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalAmount?: number = 0;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalWeight?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: Date;

  @IsOptional()
  @IsDateString()
  deliveryDate?: Date;

  // Optional array of order items
  @IsOptional()
  items?: any[];
} 