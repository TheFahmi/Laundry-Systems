import { ServiceService } from './service.service';
import { Service } from './entities/service.entity';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    create(service: Service): Promise<Service>;
    update(id: number, service: Service): Promise<Service>;
    remove(id: number): Promise<void>;
}
