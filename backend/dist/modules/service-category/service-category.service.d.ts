import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';
export declare class ServiceCategoryService {
    private serviceCategoryRepository;
    constructor(serviceCategoryRepository: Repository<ServiceCategory>);
    findAll(): Promise<ServiceCategory[]>;
    findOne(id: number): Promise<ServiceCategory>;
    create(category: ServiceCategory): Promise<ServiceCategory>;
    update(id: number, updateData: ServiceCategory): Promise<ServiceCategory>;
    remove(id: number): Promise<void>;
}
