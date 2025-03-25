import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(createPaymentDto: CreatePaymentDto): unknown;
    findAll(page?: number, limit?: number, status?: string, method?: string): unknown;
    findByOrderId(orderId: string): unknown;
    findOne(id: string): unknown;
    update(id: string, updatePaymentDto: UpdatePaymentDto): unknown;
    remove(id: string): unknown;
}
