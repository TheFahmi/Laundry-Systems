import { ServiceCategoryService } from './service-category.service';
import { ServiceCategory } from './entities/service-category.entity';
export declare class ServiceCategoryController {
    private readonly serviceCategoryService;
    constructor(serviceCategoryService: ServiceCategoryService);
    findAll(): Promise<ServiceCategory[]>;
    findOne(id: number): Promise<ServiceCategory>;
    create(serviceCategory: ServiceCategory): Promise<ServiceCategory>;
    update(id: number, serviceCategory: ServiceCategory): Promise<ServiceCategory>;
    remove(id: number): Promise<void>;
}
