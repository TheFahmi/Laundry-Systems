import { OrderStatus } from '../../../models/order.entity';
export declare class CreateOrderDto {
    customerId: string;
    status?: OrderStatus;
    totalAmount: number;
    totalWeight?: number;
    notes?: string;
    specialRequirements?: string;
    pickupDate?: Date;
    deliveryDate?: Date;
}
