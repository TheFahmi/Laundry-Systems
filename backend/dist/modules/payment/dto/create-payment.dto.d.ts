import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';
export declare class CreatePaymentDto {
    orderId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
    notes?: string;
    referenceNumber?: string;
}
