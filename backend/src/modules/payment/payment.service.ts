import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { PaymentMethod } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ items: Payment[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order');
    
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
      
      if (filters.customer_id) {
        queryBuilder.andWhere('payment.customerId = :customerId', { customerId: filters.customer_id });
      }
    }
    
    // Add pagination
    queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findCustomerPayments(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
  ): Promise<{ items: Payment[]; total: number; page: number; limit: number }> {
    
    // Create query builder
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order');
    
    // Production env: Customer ID filter must be provided and strictly enforced 
    if (process.env.NODE_ENV === 'production') {
      if (!filters.customer_id) {
        throw new ForbiddenException('Customer ID is required for getting payments');
      }
      queryBuilder.andWhere('payment.customerId = :customerId', { customerId: filters.customer_id });
    } else {
      // Development: Show all payments or filter by customer ID if provided
      if (filters.customer_id) {
        queryBuilder.andWhere('payment.customerId = :customerId', { customerId: filters.customer_id });
      } else {
        console.log('[payment.service] Running in development mode - showing all payments');
      }
    }
    
    // Apply payment status filter if provided
    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    // Apply payment method filter if provided
    if (filters.method) {
      queryBuilder.andWhere('payment.paymentMethod = :method', { method: filters.method });
    }
    
    // Get total count for pagination
    const total = await queryBuilder.getCount();
    
    // Apply pagination and ordering
    queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    // Get results
    const items = await queryBuilder.getMany();
    
    // For development: return mock payments if no results found
    if (items.length === 0 && process.env.NODE_ENV !== 'production') {
      console.log(`[payment.service] No payments found, returning mock data for customer ${filters.customer_id || 'unknown'}`);
      const mockPayments = this.generateMockPayments(
        filters.customer_id || '00000000-0000-0000-0000-000000000000',
        limit
      );
      
      return {
        items: mockPayments,
        total: mockPayments.length,
        page,
        limit
      };
    }
    
    return {
      items,
      total,
      page,
      limit
    };
  }

  async findOrderPayments(orderId: string, user: any): Promise<Payment[] | { items: Payment[]; total: number }> {
    // Validate user has permission to access this order
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.orderId = :orderId', { orderId });
      
    // If user is a customer, verify ownership
    if (user && user.role === 'customer') {
      queryBuilder.andWhere('payment.customerId = :customerId', { customerId: user.id });
    }
    
    const payments = await queryBuilder.getMany();
    
    // If no payments are found and in development, return mock data
    if (payments.length === 0 && process.env.NODE_ENV !== 'production') {
      console.log(`[payment.service] No payments found for order ${orderId}, returning mock data for development`);
      
      // Create a mock payment for this order
      const mockPayment = {
        id: `mock-pay-${orderId.substring(0, 8)}`,
        orderId,
        customerId: user.id,
        amount: 75000, // Sample amount
        paymentMethod: 'cash',
        status: 'completed',
        transactionId: null,
        referenceNumber: `PAY-ORD-${orderId.substring(0, 8)}`,
        notes: 'Mock payment for development',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
      } as unknown as Payment;
      
      return {
        items: [mockPayment],
        total: 1
      };
    }
    
    return {
      items: payments,
      total: payments.length
    };
  }

  async findPendingPaymentForOrder(orderId: string, customerId: string): Promise<Payment | null> {
    // First, check if the order belongs to the customer
    const order = await this.orderRepository.findOne({ 
      where: { id: orderId, customerId } 
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found or doesn't belong to you`);
    }
    
    // Look for pending payments for this order
    const pendingPayment = await this.paymentRepository.findOne({
      where: {
        orderId,
        customerId,
        status: PaymentStatus.PENDING
      },
      relations: ['order']
    });
    
    return pendingPayment;
  }

  async findOne(id: string, user?: any): Promise<Payment> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('payment.id = :id', { id });
    
    const payment = await queryBuilder.getOne();
    
    // If not in production and payment not found, return mock data for testing
    if (!payment && process.env.NODE_ENV !== 'production') {
      console.log(`[payment.service] Payment with ID ${id} not found, returning mock data for development`);
      
      // Check if this is a mock ID from our mock data
      if (id.startsWith('mock-pay-')) {
        const mockPayment = {
          id,
          orderId: `mock-ord-${id.split('-')[2]}`,
          customerId: user?.id || 'mock-customer',
          amount: 75000,
          paymentMethod: "bank_transfer",
          status: "completed",
          transactionId: "TRX-MOCK-12345",
          referenceNumber: `PAY-MOCK-${id.split('-')[2]}`,
          notes: "Mock payment for development",
          createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          updatedAt: new Date(Date.now() - 86400000),
          order: {
            id: `mock-ord-${id.split('-')[2]}`,
            orderNumber: `ORD-MOCK-${id.split('-')[2]}`,
            customerId: user?.id || 'mock-customer',
            totalPrice: 75000,
            status: "completed",
            createdAt: new Date(Date.now() - 86400000 * 3),
          }
        } as unknown as Payment;
        
        return mockPayment;
      }
    }
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    // If user is a customer, verify ownership
    if (user && user.role === 'customer' && payment.customerId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this payment');
    }
    
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // If referenceNumber is not provided, generate one
    if (!createPaymentDto.referenceNumber) {
      createPaymentDto.referenceNumber = `PAY-${Date.now()}`;
    }
    
    // If customerId is not provided but we have orderId, try to get customerId from order
    if (!createPaymentDto.customerId && createPaymentDto.orderId) {
      try {
        const order = await this.orderRepository.findOne({
          where: { id: createPaymentDto.orderId }
        });
        
        if (order && order.customerId) {
          createPaymentDto.customerId = order.customerId;
          console.log(`[payment.service] Added customerId ${order.customerId} from order to payment`);
        }
      } catch (error) {
        console.error(`[payment.service] Error getting customerId from order: ${error.message}`);
      }
    }
    
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async createCustomerPayment(createPaymentDto: CreatePaymentDto, customerId: string): Promise<Payment> {
    // Verify that the order belongs to the customer
    const order = await this.orderRepository.findOne({ 
      where: { id: createPaymentDto.orderId } 
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${createPaymentDto.orderId} not found`);
    }
    
    if (order.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to make a payment for this order');
    }
    
    // If referenceNumber is not provided, generate one
    if (!createPaymentDto.referenceNumber) {
      createPaymentDto.referenceNumber = `PAY-${Date.now()}`;
    }
    
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      customerId,
      status: PaymentStatus.PENDING // Always start with pending for customer payments
    });
    
    return this.paymentRepository.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, user?: any): Promise<Payment> {
    const payment = await this.findOne(id);
    
    // If user is a customer, verify ownership and restrict what can be updated
    if (user && user.role === 'customer') {
      if (payment.customerId !== user.id) {
        throw new ForbiddenException('You do not have permission to update this payment');
      }
      
      // Customers can only update certain fields
      const allowedFields = ['transactionId', 'notes'];
      const attemptedFields = Object.keys(updatePaymentDto);
      
      for (const field of attemptedFields) {
        if (!allowedFields.includes(field)) {
          throw new ForbiddenException(`Customers cannot update the '${field}' field`);
        }
      }
    }
    
    this.paymentRepository.merge(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string, user?: any): Promise<void> {
    const payment = await this.findOne(id);
    
    // If user is a customer, verify ownership
    if (user && user.role === 'customer') {
      if (payment.customerId !== user.id) {
        throw new ForbiddenException('You do not have permission to delete this payment');
      }
      
      // Customers can only delete pending payments
      if (payment.status !== PaymentStatus.PENDING) {
        throw new ForbiddenException('You can only delete pending payments');
      }
    }
    
    await this.paymentRepository.remove(payment);
  }

  /**
   * Generate mock payment data for development/testing purposes
   */
  private generateMockPayments(customerId: string, count: number = 3): Payment[] {
    const mockPayments = [
      {
        id: "mock-pay-001",
        orderId: "mock-ord-001",
        orderNumber: "ORD-20250401-00001",
        customerId: customerId,
        amount: 75000,
        paymentMethod: PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        transactionId: null,
        referenceNumber: "PAY-20250401-00001",
        notes: "Pembayaran di toko",
        createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3),
        order: {
          id: "mock-ord-001",
          orderNumber: "ORD-20250401-00001",
          status: OrderStatus.DELIVERED
        }
      },
      {
        id: "mock-pay-002",
        orderId: "mock-ord-002",
        orderNumber: "ORD-20250402-00002",
        customerId: customerId,
        amount: 120000,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        transactionId: "TRX-12345",
        referenceNumber: "PAY-20250402-00002",
        notes: "Menunggu konfirmasi",
        createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000 * 1),
        order: {
          id: "mock-ord-002",
          orderNumber: "ORD-20250402-00002",
          status: OrderStatus.PROCESSING
        }
      },
      {
        id: "mock-pay-003",
        orderId: "mock-ord-003",
        orderNumber: "ORD-20250330-00003",
        customerId: customerId,
        amount: 45000,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        transactionId: "CC-67890",
        referenceNumber: "PAY-20250330-00003",
        notes: null,
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        updatedAt: new Date(Date.now() - 86400000 * 5),
        order: {
          id: "mock-ord-003",
          orderNumber: "ORD-20250330-00003",
          status: OrderStatus.DELIVERED
        }
      }
    ] as unknown as Payment[];
    
    return mockPayments.slice(0, count);
  }
} 