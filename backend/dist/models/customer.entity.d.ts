import { Order } from './order.entity';
import { Payment } from './payment.entity';
export declare class Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    orders: Order[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
