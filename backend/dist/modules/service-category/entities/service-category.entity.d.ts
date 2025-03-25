import { Service } from '../../service/entities/service.entity';
export declare class ServiceCategory {
    id: number;
    name: string;
    description: string;
    services: Service[];
    createdAt: Date;
    updatedAt: Date;
}
