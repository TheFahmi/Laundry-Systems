import { Service } from '../../service/entities/service.entity';
export declare class ServiceCategory {
    id: string;
    name: string;
    description: string;
    services: Service[];
    createdAt: Date;
    updatedAt: Date;
}
