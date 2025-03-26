import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceService {
    private serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    create(createServiceDto: CreateServiceDto): Promise<Service>;
    findAll(options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: Service[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Service>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<void>;
    save(serviceData: any): Promise<Service>;
}
