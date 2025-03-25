import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payment, PaymentMethod, PaymentStatus } from '../payment/entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>
  ) {}

  async generateOrderNumber(): Promise<string> {
    // Format: ORD-YYYYMMDD-XXXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Buat instance Customer berdasarkan customerId
    const customer = { id: createOrderDto.customerId } as any;
    
    // Hilangkan customerId dari DTO dan tambahkan referensi customer
    const { customerId, ...orderData } = createOrderDto;
    const newOrder = this.orderRepository.create({
      ...orderData,
      customer,
      orderNumber: await this.generateOrderNumber()
    });
    
    return this.orderRepository.save(newOrder);
  }

  // Add this method to calculate the total amount from order items
  private calculateTotalAmount(items: any[]): number {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      // Use subtotal if available, otherwise calculate from price * quantity
      const itemTotal = item.subtotal || (item.price * item.quantity) || 0;
      return total + Number(itemTotal);
    }, 0);
  }

  async findAll(options: { page: number; limit: number }): Promise<{ items: Order[]; total: number; page: number; limit: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await this.orderRepository.findAndCount({
        relations: ['customer', 'items', 'items.service', 'payments'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      // Transform the data to match the frontend's expected format
      const items = data.map(order => {
        try {
          // Ensure customer data is available for the frontend
          const customerName = order.customer ? order.customer.name : 'Unknown Customer';
          
          // Add customer name to order object
          const orderWithCustomer = {
            ...order,
            customerName // Add customerName field directly
          };
          
          // Process order items to ensure they have serviceName, unitPrice, totalPrice
          if (Array.isArray(order.items)) {
            order.items.forEach(item => {
              try {
                // Add serviceName if it doesn't exist
                if (!item.serviceName) {
                  item.serviceName = item.service ? item.service.name : `Service #${item.serviceId || 'Unknown'}`;
                }
                
                // Ensure price is not null or zero
                if (!item.price) {
                  item.price = item.service ? item.service.price : 15000; // Default price
                }
                
                // Ensure subtotal is calculated
                if (!item.subtotal) {
                  item.subtotal = item.price * item.quantity;
                }
              } catch (itemErr) {
                console.error(`Error processing order item: ${itemErr.message}`);
                item.serviceName = 'Unknown Service';
                item.price = item.price || 15000;
                item.subtotal = item.subtotal || (item.price * item.quantity);
              }
            });
          }
          
          // If order doesn't have payments, add a default payment object
          if (!order.payments || order.payments.length === 0) {
            order.payments = [{
              id: `TEMP-${Date.now()}-${order.id}`,
              referenceNumber: `REF-${order.orderNumber || order.id}`,
              amount: order.totalAmount || 0,
              method: PaymentMethod.CASH,
              status: PaymentStatus.PENDING,
              createdAt: new Date(),
              order: order
            } as any];
          }

          // Recalculate total amount to ensure it matches the sum of items
          orderWithCustomer.totalAmount = this.calculateTotalAmount(order.items);
          
          return orderWithCustomer;
        } catch (orderErr) {
          console.error(`Error transforming order: ${orderErr.message}`);
          // Return minimal order data if transformation fails
          return {
            ...order,
            customerName: 'Unknown Customer',
            items: [],
            payments: [{
              id: `TEMP-${Date.now()}`,
              referenceNumber: 'Default Payment',
              amount: 0,
              method: PaymentMethod.CASH,
              status: PaymentStatus.PENDING,
              createdAt: new Date()
            } as any]
          } as Order;
        }
      });

      return { 
        items, 
        total, 
        page, 
        limit 
      };
    } catch (error) {
      console.error(`Error in findAll method: ${error.message}`);
      // Return empty result with correct format on error
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
  }

  async findOne(id: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['customer', 'items', 'items.service', 'payments']
      });

      if (!order) {
        throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
      }

      // Add customer name to order object
      const customerName = order.customer ? order.customer.name : 'Unknown Customer';
      order['customerName'] = customerName;
      
      // Process order items to ensure they have serviceName and valid price/subtotal
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          try {
            // Add serviceName if it doesn't exist
            if (!item.serviceName) {
              item.serviceName = item.service ? item.service.name : `Service #${item.serviceId || 'Unknown'}`;
            }
            
            // Ensure price is not null or zero
            if (!item.price) {
              item.price = item.service ? item.service.price : 15000; // Default price
            }
            
            // Ensure subtotal is calculated
            if (!item.subtotal) {
              item.subtotal = item.price * item.quantity;
            }
          } catch (itemErr) {
            console.error(`Error processing order item: ${itemErr.message}`);
            item.serviceName = 'Unknown Service';
            item.price = item.price || 15000;
            item.subtotal = item.subtotal || (item.price * item.quantity);
          }
        });
      }
      
      // Recalculate total amount to ensure it matches the sum of items
      order.totalAmount = this.calculateTotalAmount(order.items);

      // If order doesn't have payments, create a default payment
      if (!order.payments || order.payments.length === 0) {
        try {
          // Get the EntityManager from the repository
          const entityManager = this.orderRepository.manager;
          
          // Create a payment ID
          const paymentId = `PAYMENT-${Date.now()}`;
          const referenceNumber = `REF-${order.orderNumber || order.id}`;
          
          // Create new payment directly
          const payment = new Payment();
          payment.id = paymentId;
          payment.referenceNumber = referenceNumber;
          payment.amount = order.totalAmount || 0;
          payment.method = PaymentMethod.CASH;
          payment.status = PaymentStatus.PENDING;
          payment.order = order;
          payment.customerId = order.customer?.id;
          payment.createdAt = new Date();
          payment.updatedAt = new Date();
          
          // Save the payment
          await entityManager.save(payment);
          
          // Refresh the order to include the new payment
          order.payments = [payment];
          
          console.log(`Created default payment for order ${order.id}`);
        } catch (paymentErr) {
          console.error(`Error creating default payment: ${paymentErr.message}`);
          
          // If we can't save to the database, at least return a default payment object
          order.payments = [{
            id: `TEMP-${Date.now()}`,
            referenceNumber: `REF-${order.orderNumber || order.id}`,
            amount: order.totalAmount || 0,
            method: PaymentMethod.CASH,
            status: PaymentStatus.PENDING,
            createdAt: new Date(),
            order: order
          } as any];
        }
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      
      console.error(`Error in findOne method: ${error.message}`);
      throw new Error(`Unable to retrieve order: ${error.message}`);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    
    const updatedOrder = this.orderRepository.merge(order, updateOrderDto);
    return this.orderRepository.save(updatedOrder);
  }

  async remove(id: string): Promise<{ affected: number }> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return { affected: result.affected };
  }

  async createDefaultPayment(order: Order): Promise<Payment> {
    try {
      const totalAmount = this.calculateTotalAmount(order.items);
      const paymentId = uuidv4();
      
      const payment = this.paymentRepository.create({
        id: paymentId,
        orderId: order.id,
        customerId: order.customerId,
        amount: totalAmount,
        method: PaymentMethod.CASH, // Use enum value
        status: PaymentStatus.PENDING, // Use enum value
        transactionId: `TRX-${Date.now()}`
      });
      
      return await this.paymentRepository.save(payment);
    } catch (error) {
      console.error('Error creating default payment:', error);
      return null;
    }
  }
} 