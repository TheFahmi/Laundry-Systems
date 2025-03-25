import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from '../../models/customer.entity';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(page?: number, limit?: number): Promise<any>;
    getCreateForm(): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
