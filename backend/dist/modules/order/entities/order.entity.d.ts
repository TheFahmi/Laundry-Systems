import { Customer } from '../../customer/customer.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { OrderItem } from './order-item.entity';
export declare class Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customer: Customer;
    totalAmount: number;
    totalWeight: number;
    status: string;
    notes: string;
    specialRequirements: string;
    pickupDate: Date;
    deliveryDate: Date;
    payments: Payment[];
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
