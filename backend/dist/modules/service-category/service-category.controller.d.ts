import { ServiceCategoryService } from './service-category.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
export declare class ServiceCategoryController {
    private readonly serviceCategoryService;
    constructor(serviceCategoryService: ServiceCategoryService);
    create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<import("./entities/service-category.entity").ServiceCategory>;
    findAll(page?: number, limit?: number): Promise<{
        items: import("./entities/service-category.entity").ServiceCategory[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./entities/service-category.entity").ServiceCategory>;
    findServices(id: string): Promise<import("../service/entities/service.entity").Service[]>;
    update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<import("./entities/service-category.entity").ServiceCategory>;
    remove(id: string): Promise<void>;
}
