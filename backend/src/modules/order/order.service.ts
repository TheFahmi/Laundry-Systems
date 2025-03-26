import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
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
    private paymentRepository: Repository<Payment>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>
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

  async create(createOrderDto: any): Promise<Order> {
    try {
      // Create a new ID if not provided
      const orderId = uuidv4();
      
      // Create an order number (ORD-yyyyMMdd-xxxx format)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randomNum}`;
      
      // Default status if not provided
      const status = createOrderDto.status || 'new';
      
      // Create order items if provided
      let items = [];
      if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
        items = createOrderDto.items.map(item => {
          const itemId = uuidv4();
          return this.orderItemRepository.create({
            id: itemId,
            orderId,
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          });
        });
      }
      
      // Save order items
      if (items.length > 0) {
        await this.orderItemRepository.save(items);
      }
      
      // Calculate total amount from items if not provided
      let totalAmount = createOrderDto.totalAmount || 0;
      if (items.length > 0 && !totalAmount) {
        totalAmount = this.calculateTotalAmount(items);
      }
      
      // Create order entity
      const order = this.orderRepository.create({
        id: orderId,
        orderNumber,
        customerId: createOrderDto.customerId,
        status,
        totalAmount,
        totalWeight: createOrderDto.totalWeight || 0,
        notes: createOrderDto.notes,
        specialRequirements: createOrderDto.specialRequirements,
        pickupDate: createOrderDto.pickupDate || new Date(),
        deliveryDate: createOrderDto.deliveryDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Save order
      const savedOrder = await this.orderRepository.save(order);
      
      // Add items to the saved order
      savedOrder.items = items;
      
      return savedOrder;
    } catch (error) {
      console.error(`Error creating order: ${error.message}`);
      throw new Error(`Failed to create order: ${error.message}`);
    }
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

  async findAll(options: { page: number; limit: number }): Promise<{ 
    data: Order[]; 
    meta: { 
      totalItems: number; 
      totalPages: number;
      currentPage: number; 
      itemsPerPage: number; 
    } 
  }> {
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
      const mappedItems = data.map(order => {
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
              } catch (itemError) {
                console.error(`Error processing item in order ${order.id}:`, itemError);
              }
            });
          }

          return orderWithCustomer;
        } catch (orderError) {
          console.error(`Error processing order ${order.id}:`, orderError);
          return order; // Return the original order if there's an error in processing
        }
      });

      return {
        data: mappedItems,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error(`Error in findAll method: ${error.message}`);
      // Return empty result with correct format on error
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          itemsPerPage: limit
        }
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