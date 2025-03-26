import { ServiceCategory } from '../../service-category/entities/service-category.entity';
export declare class Service {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    estimatedTime: number;
    isActive: boolean;
    categoryId: string;
    category: ServiceCategory;
    createdAt: Date;
    updatedAt: Date;
}
