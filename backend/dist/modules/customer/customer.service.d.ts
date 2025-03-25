import { Repository } from 'typeorm';
import { Customer } from '../../models/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomerService {
    private customerRepository;
    constructor(customerRepository: Repository<Customer>);
    generateCustomerId(customerId: number): Promise<string>;
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(options: {
        page: number;
        limit: number;
    }): Promise<{
        data: Customer[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
