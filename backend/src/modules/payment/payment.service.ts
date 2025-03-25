import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      id: uuidv4(),
      ...createPaymentDto,
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(options: { 
    page: number; 
    limit: number; 
    status?: string; 
    method?: string;
  }): Promise<{ items: Payment[]; total: number; page: number; limit: number }> {
    try {
      const { page, limit, status, method } = options;
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (method) whereClause.method = method;

      const [data, total] = await this.paymentRepository.findAndCount({
        where: whereClause,
        relations: ['order', 'customer'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      // Transform data to add any additional information
      const items = data.map(payment => {
        // Add customer name if available
        if (payment.customer) {
          payment['customerName'] = payment.customer.name;
        }
        
        // Add order number if available
        if (payment.order) {
          payment['orderNumber'] = payment.order.orderNumber;
        }
        
        return payment;
      });

      return { 
        items, 
        total, 
        page: options.page, 
        limit: options.limit 
      };
    } catch (error) {
      console.error(`Error in findAll method: ${error.message}`);
      // Return empty result with correct format on error
      return {
        items: [],
        total: 0,
        page: options.page,
        limit: options.limit
      };
    }
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    try {
      const payments = await this.paymentRepository.find({
        where: { order: { id: orderId } },
        relations: ['customer'],
        order: { createdAt: 'DESC' }
      });
      
      return payments;
    } catch (error) {
      console.error(`Error finding payments for order ${orderId}: ${error.message}`);
      return [];
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id },
        relations: ['order', 'customer']
      });
      
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error finding payment ${id}: ${error.message}`);
      throw new Error(`Unable to retrieve payment: ${error.message}`);
    }
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