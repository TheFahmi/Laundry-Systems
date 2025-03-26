import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    findAll(page?: number, limit?: number): Promise<{
        items: Order[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCreateForm(): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<Order>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<{
        affected: number;
    }>;
}
