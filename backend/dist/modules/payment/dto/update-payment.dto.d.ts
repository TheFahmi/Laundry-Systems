import { PaymentMethod, PaymentStatus } from '../../../models/payment.entity';
export declare class UpdatePaymentDto {
    amount?: number;
    method?: PaymentMethod;
    transactionId?: string;
    status?: PaymentStatus;
    orderId?: string;
}
