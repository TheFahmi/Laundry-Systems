import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payment } from '../payment/entities/payment.entity';
import { Service } from '../service/entities/service.entity';
export declare class OrderService {
    private orderRepository;
    private paymentRepository;
    private orderItemRepository;
    private serviceRepository;
    constructor(orderRepository: Repository<Order>, paymentRepository: Repository<Payment>, orderItemRepository: Repository<OrderItem>, serviceRepository: Repository<Service>);
    generateOrderNumber(): Promise<string>;
    create(createOrderDto: CreateOrderDto): Promise<{
        data: Order;
    }>;
    private calculateTotalAmount;
    findAll({ page, limit, status }: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
    }): Promise<{
        items: Order[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    remove(id: string): Promise<void>;
    createDefaultPayment(order: Order): Promise<Payment>;
}
