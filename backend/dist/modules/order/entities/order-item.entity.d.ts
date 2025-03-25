import { Order } from './order.entity';
import { Service } from '../../service/entities/service.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    serviceId: number;
    service: Service;
    serviceName: string;
    quantity: number;
    price: number;
    subtotal: number;
    createdAt: Date;
    updatedAt: Date;
    calculateSubtotal(): void;
}
