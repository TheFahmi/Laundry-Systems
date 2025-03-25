import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
export declare class ServiceService {
    private serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    create(service: Service): Promise<Service>;
    update(id: number, updateData: Service): Promise<Service>;
    remove(id: number): Promise<void>;
}
