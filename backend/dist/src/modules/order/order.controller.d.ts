import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order.entity';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto): Promise<{
        data: Order;
    }>;
    getCreateForm(): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: OrderStatus): Promise<{
        items: Order[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    remove(id: string): Promise<void>;
}
