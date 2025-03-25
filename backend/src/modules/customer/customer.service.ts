import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../models/customer.entity';
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
    const newCustomer = this.customerRepository.create(createCustomerDto);
    
    // Simpan terlebih dahulu untuk mendapatkan id
    const savedCustomer = await this.customerRepository.save(newCustomer);
    
    // Buat ID dengan format yang diinginkan menggunakan id yang dihasilkan
    const formattedId = await this.generateCustomerId(parseInt(savedCustomer.id));
    savedCustomer.id = formattedId;
    
    // Simpan kembali untuk memperbarui ID
    return this.customerRepository.save(savedCustomer);
  }

  async findAll(options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [customers, total] = await this.customerRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!customer) {
      throw new NotFoundException(`Pelanggan dengan ID "${id}" tidak ditemukan`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    this.customerRepository.merge(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
    return { message: 'Pelanggan berhasil dihapus' };
  }
} 