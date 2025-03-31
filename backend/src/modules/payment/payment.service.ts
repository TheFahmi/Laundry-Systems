import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');
    
    // Apply filters
    if (filters) {
      if (filters.order_id) {
        queryBuilder.andWhere('payment.orderId = :orderId', { orderId: filters.order_id });
      }
      
      if (filters.status) {
        queryBuilder.andWhere('payment.status = :status', { status: filters.status });
      }
      
      if (filters.method) {
        queryBuilder.andWhere('payment.paymentMethod = :method', { method: filters.method });
      }
    }
    
    // Add pagination
    queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      referenceNumber: createPaymentDto.referenceNumber || `PAY-${Date.now()}`
    });
    return this.paymentRepository.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    this.paymentRepository.merge(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
} 