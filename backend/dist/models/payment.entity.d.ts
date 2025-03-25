import { Customer } from './customer.entity';
import { Order } from './order.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    TRANSFER = "transfer",
    EWALLET = "ewallet",
    OTHER = "other"
}
export declare class Payment {
    id: string;
    paymentId: number;
    referenceNumber: string;
    customer: Customer;
    order: Order;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    notes: string;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
}
