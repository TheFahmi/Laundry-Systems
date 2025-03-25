import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payment } from '../payment/entities/payment.entity';
export declare class OrderService {
    private orderRepository;
    private paymentRepository;
    constructor(orderRepository: Repository<Order>, paymentRepository: Repository<Payment>);
    generateOrderNumber(): Promise<string>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    private calculateTotalAmount;
    findAll(options: {
        page: number;
        limit: number;
    }): Promise<{
        items: Order[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<{
        affected: number;
    }>;
    createDefaultPayment(order: Order): Promise<Payment>;
}
