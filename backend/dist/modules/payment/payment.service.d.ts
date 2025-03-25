import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentService {
    private paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findAll(options: {
        page: number;
        limit: number;
        status?: string;
        method?: string;
    }): Promise<{
        items: Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByOrderId(orderId: string): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    remove(id: string): Promise<void>;
}
