import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
export declare enum OrderStatus {
    NEW = "new",
    PROCESSING = "processing",
    WASHING = "washing",
    DRYING = "drying",
    FOLDING = "folding",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: string;
    orderNumber: string;
    customer: Customer;
    status: OrderStatus;
    totalAmount: number;
    totalWeight: number;
    notes: string;
    specialRequirements: string;
    pickupDate: Date;
    deliveryDate: Date;
    items: OrderItem[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
