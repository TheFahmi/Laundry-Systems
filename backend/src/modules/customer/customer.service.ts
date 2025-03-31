import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) {}

  async generateCustomerId(customerId: number): Promise<string> {
    // Format: CUST-0000001
    return `CUST-${customerId.toString().padStart(7, '0')}`;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(options: { page: number; limit: number; search?: string }): Promise<{
    items: Customer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    try {
      let whereClause = '';
      const queryParams: any[] = [limit, skip];
      
      if (search) {
        whereClause = `WHERE name ILIKE $3 OR phone ILIKE $3 OR email ILIKE $3`;
        queryParams.push(`%${search}%`);
      }
      
      // Use direct SQL query to bypass any ORM mapping issues
      const totalResult = await this.customerRepository.query(
        `SELECT COUNT(*) as count FROM customers ${whereClause}`,
        search ? [`%${search}%`] : []
      );
      const total = parseInt(totalResult[0].count);
      
      const data = await this.customerRepository.query(
        `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, 
        queryParams
      );
      
      // Map the snake_case column names back to camelCase for the entity
      const items = data.map(item => {
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      });

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
  }

  async search(query: string): Promise<Customer[]> {
    try {
      if (!query || query.trim() === '') {
        return [];
      }
      
      const searchParam = `%${query}%`;
      
      const data = await this.customerRepository.query(
        `SELECT * FROM customers 
         WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
         ORDER BY created_at DESC
         LIMIT 10`, 
        [searchParam]
      );
      
      // Map the snake_case column names back to camelCase for the entity
      return data.map(item => {
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      });
    } catch (error) {
      console.error('Error in search:', error);
      return [];
    }
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders']
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    const updated = Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  }
} 