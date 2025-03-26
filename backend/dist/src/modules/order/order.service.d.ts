import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payment } from '../payment/entities/payment.entity';
export declare class OrderService {
    private orderRepository;
    private paymentRepository;
    private orderItemRepository;
    constructor(orderRepository: Repository<Order>, paymentRepository: Repository<Payment>, orderItemRepository: Repository<OrderItem>);
    generateOrderNumber(): Promise<string>;
    create(createOrderDto: any): Promise<Order>;
    private calculateTotalAmount;
    findAll(options: {
        page: number;
        limit: number;
    }): Promise<{
        data: Order[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<{
        affected: number;
    }>;
    createDefaultPayment(order: Order): Promise<Payment>;
}
