import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from '../service/entities/service.entity';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
export declare class ServiceCategoryService {
    private serviceCategoryRepository;
    private serviceRepository;
    constructor(serviceCategoryRepository: Repository<ServiceCategory>, serviceRepository: Repository<Service>);
    create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory>;
    findAll(options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: ServiceCategory[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<ServiceCategory>;
    findServices(id: string): Promise<Service[]>;
    update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategory>;
    remove(id: string): Promise<void>;
}
