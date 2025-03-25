import { Order } from './order.entity';
import { Service } from './service.entity';
export declare class OrderItem {
    id: string;
    order: Order;
    service: Service;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
