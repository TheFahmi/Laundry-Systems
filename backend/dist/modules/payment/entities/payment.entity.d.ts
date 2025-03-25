import { Order } from '../../order/entities/order.entity';
import { Customer } from '../../customer/customer.entity';
export declare enum PaymentMethod {
    CASH = "cash",
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    TRANSFER = "transfer",
    EWALLET = "ewallet",
    OTHER = "other"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare class Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
    referenceNumber: string;
    paymentId: number;
    orderId: string;
    order: Order;
    customerId: string;
    customer: Customer;
    createdAt: Date;
    updatedAt: Date;
}
