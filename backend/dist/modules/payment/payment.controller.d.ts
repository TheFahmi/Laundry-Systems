import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(createPaymentDto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    findAll(page?: number, limit?: number, status?: string, method?: string): Promise<{
        items: import("./entities/payment.entity").Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByOrderId(orderId: string): Promise<import("./entities/payment.entity").Payment[]>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    remove(id: string): Promise<void>;
}
