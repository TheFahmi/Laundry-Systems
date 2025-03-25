import { ServiceCategory } from '../../service-category/entities/service-category.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
export declare class Service {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    category: ServiceCategory;
    orderItems: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
