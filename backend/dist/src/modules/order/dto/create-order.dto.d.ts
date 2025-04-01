import { OrderStatus } from '../entities/order.entity';
import { PaymentMethod } from '../../payment/entities/payment.entity';
export declare class OrderItemDto {
    serviceId: string;
    quantity: number;
    weight?: number;
    price?: number;
    serviceName?: string;
    weightBased?: boolean;
}
export declare class PaymentInfoDto {
    amount: number;
    change: number;
    method: PaymentMethod;
    referenceNumber?: string;
}
export declare class CreateOrderDto {
    customerId: string;
    status?: OrderStatus;
    notes?: string;
    specialRequirements?: string;
    totalAmount?: number;
    total?: number;
    totalWeight?: number;
    pickupDate?: Date;
    deliveryDate?: Date;
    isDeliveryNeeded?: boolean;
    items: OrderItemDto[];
    payment?: PaymentInfoDto;
}
