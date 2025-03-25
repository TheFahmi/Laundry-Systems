import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';
export declare class PaymentResponseDto {
    id: string;
    orderId: string;
    customerName: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
