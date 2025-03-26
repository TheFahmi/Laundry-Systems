import { ServiceService } from './service.service';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    findAll(page?: number, limit?: number): Promise<{
        data: Service[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    findOne(id: string): Promise<Service>;
    create(createServiceDto: CreateServiceDto): Promise<Service>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<void>;
}
