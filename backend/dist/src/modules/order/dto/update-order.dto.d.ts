import { CreateOrderDto, OrderItemDto } from './create-order.dto';
import { OrderStatus } from '../entities/order.entity';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatus;
    notes?: string;
    specialRequirements?: string;
    totalAmount?: number;
    totalWeight?: number;
    pickupDate?: Date;
    deliveryDate?: Date;
    isDeliveryNeeded?: boolean;
    customerId?: string;
    items?: OrderItemDto[];
}
export {};
