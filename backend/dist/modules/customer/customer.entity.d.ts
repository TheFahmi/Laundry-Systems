import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
export declare class Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    orders: Order[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
