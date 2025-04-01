import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DeepPartial, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Payment, PaymentMethod, PaymentStatus } from '../payment/entities/payment.entity';
import { Service } from '../service/entities/service.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>
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

  async create(createOrderDto: CreateOrderDto): Promise<{ data: Order }> {
    // Use a database transaction to ensure all operations are atomic
    return this.orderRepository.manager.transaction(async (transactionalEntityManager: EntityManager) => {
      try {
        console.log('Starting order creation with data:', JSON.stringify(createOrderDto));
        
        // Create a new ID
        const orderId = uuidv4();
        console.log('Generated order ID:', orderId);
        
        // Generate order number
        const orderNumber = await this.generateOrderNumber();
        console.log('Generated order number:', orderNumber);
        
        // Calculate total amount from items if not provided
        let totalAmount = createOrderDto.totalAmount;
        if (createOrderDto.total !== undefined) {
          totalAmount = createOrderDto.total;
        }
        if (!totalAmount && createOrderDto.items && Array.isArray(createOrderDto.items)) {
          totalAmount = this.calculateTotalAmount(createOrderDto.items);
        }
        totalAmount = totalAmount || 0;
        console.log('Calculated total amount:', totalAmount);
        
        // Calculate totalWeight from weight-based items
        let totalWeight = 0;
        if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
          totalWeight = createOrderDto.items.reduce((sum, item) => {
            if (item.weightBased) {
              // Use weight property if available, otherwise use quantity
              const weight = parseFloat(String(item.weight || item.quantity || '0').replace(',', '.'));
              return sum + (isNaN(weight) ? 0 : weight);
            }
            return sum;
          }, 0);
          
          console.log(`Calculated total weight for order: ${totalWeight} kg`);
        }
        
        // Create order entity - always set status to NEW or PENDING, not COMPLETED
        const orderData: DeepPartial<Order> = {
          id: orderId,
          orderNumber,
          customerId: createOrderDto.customerId,
          status: OrderStatus.NEW, // Order always starts as NEW
          totalAmount,
          totalWeight,
          notes: createOrderDto.notes || '',
          specialRequirements: createOrderDto.specialRequirements || '',
          pickupDate: createOrderDto.pickupDate || null,
          deliveryDate: createOrderDto.deliveryDate || null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Creating order with data:', JSON.stringify(orderData));
        const order = this.orderRepository.create(orderData);
        
        // Save order using transaction manager
        console.log('Saving order to database...');
        const savedOrder = await transactionalEntityManager.save(Order, order);
        console.log('Order saved successfully with ID:', savedOrder.id);
        
        // Process payment if provided in the DTO
        let payment = null;
        if (createOrderDto.payment) {
          console.log('Payment data provided:', createOrderDto.payment);
          const paymentId = uuidv4();
          
          // Convert payment method string to enum
          let paymentMethod = PaymentMethod.CASH;
          if (createOrderDto.payment.method) {
            paymentMethod = createOrderDto.payment.method as PaymentMethod;
          }
          
          // Format notes to include change if applicable
          let paymentNotes = '';
          if (createOrderDto.payment.change > 0) {
            paymentNotes = `Change amount: ${createOrderDto.payment.change}`;
          }
          
          // Set all payment methods to COMPLETED status
          const paymentStatus = PaymentStatus.COMPLETED;
          
          const paymentData: DeepPartial<Payment> = {
            id: paymentId,
            orderId: savedOrder.id,
            customerId: createOrderDto.customerId,
            amount: createOrderDto.payment.amount || totalAmount,
            paymentMethod: paymentMethod,
            status: paymentStatus, // Always set to COMPLETED regardless of payment method
            referenceNumber: createOrderDto.payment.referenceNumber || `REF-${Date.now()}`,
            transactionId: `TRX-${Date.now()}`,
            notes: paymentNotes,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('Creating payment with data:', JSON.stringify(paymentData));
          payment = this.paymentRepository.create(paymentData);
          
          // Save payment using transaction manager
          console.log('Saving payment to database...');
          payment = await transactionalEntityManager.save(Payment, payment);
          console.log('Payment saved successfully with ID:', payment.id);
        }
        
        // Pre-fetch all services needed for the items to avoid N+1 queries
        let serviceMap = new Map<string, Service>();
        if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
          // Extract unique service IDs
          const serviceIds = createOrderDto.items
            .filter(item => item.serviceId)
            .map(item => String(item.serviceId));
            
          // If we have any service IDs, fetch them all at once
          if (serviceIds.length > 0) {
            const uniqueServiceIds = [...new Set(serviceIds)];
            const services = await transactionalEntityManager.find(Service, { 
              where: { id: In(uniqueServiceIds) } 
            });
            
            // Create a map for easy lookup
            serviceMap = new Map(
              services.map(service => [service.id, service])
            );
            console.log(`Pre-fetched ${services.length} services for item processing`);
          }
        }
        
        // Process items in batches to avoid memory issues for large orders
        const BATCH_SIZE = 50;
        let savedItems: OrderItem[] = [];
        
        if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
          console.log(`Processing ${createOrderDto.items.length} order items in batches of ${BATCH_SIZE}`);
          
          // Process items in batches
          for (let i = 0; i < createOrderDto.items.length; i += BATCH_SIZE) {
            const itemBatch = createOrderDto.items.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} with ${itemBatch.length} items`);
            
            // Prepare a batch of order items
            const orderItemsToInsert: DeepPartial<OrderItem>[] = [];
            
            for (const item of itemBatch) {
              // Get weightBased property but remove it from what goes to DB
              const { weightBased, ...itemData } = item as any;
              
              try {
                // Look up the service name if not provided
                let serviceName = itemData.serviceName;
                if (!serviceName && itemData.serviceId) {
                  // Get from our pre-fetched map to avoid repeated queries
                  const service = serviceMap.get(String(itemData.serviceId));
                  if (service) {
                    serviceName = service.name;
                  } else {
                    // Fallback to generic name if not found
                    serviceName = `Service ${itemData.serviceId}`;
                  }
                }
                
                // Process item differently based on whether it's weight-based or piece-based
                if (weightBased) {
                  // For weight-based items, use weight property if available, otherwise use quantity
                  const rawWeight = parseFloat(String(itemData.weight || itemData.quantity || 0.5).replace(',', '.'));
                  // Ensure we have at least 0.1 kg for weight-based items
                  const itemWeight = Math.max(rawWeight, 0.1);
                  
                  // For weight-based items, create with weight value
                  const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
                  const subtotal = price * itemWeight;
                  
                  orderItemsToInsert.push({
                    orderId: savedOrder.id,
                    serviceId: String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'),
                    serviceName: serviceName,
                    quantity: 1, // For weight-based, quantity is always 1
                    weight: itemWeight,
                    price,
                    subtotal,
                    unitPrice: price,
                    totalPrice: subtotal,
                    notes: `Weight: ${itemWeight} kg`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                } else {
                  // For piece-based items, use integer with minimum of 1
                  const parsedQuantity = parseInt(String(itemData.quantity || 1));
                  const quantity = Math.max(parsedQuantity, 1); // Ensure at least 1 piece
                  
                  const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
                  const subtotal = price * quantity;
                  
                  orderItemsToInsert.push({
                    orderId: savedOrder.id,
                    serviceId: String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'),
                    serviceName: serviceName,
                    quantity,
                    price,
                    subtotal,
                    unitPrice: price,
                    totalPrice: subtotal,
                    notes: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                }
              } catch (error) {
                console.error('Error processing item:', error);
                // Continue processing other items even if one fails
              }
            }
            
            // Insert all items in this batch at once
            if (orderItemsToInsert.length > 0) {
              console.log(`Inserting batch of ${orderItemsToInsert.length} order items...`);
              const insertedItems = await transactionalEntityManager.save(OrderItem, orderItemsToInsert);
              savedItems = [...savedItems, ...insertedItems];
              console.log(`Successfully inserted ${insertedItems.length} items in this batch`);
            }
          }
        }
        
        console.log(`Order creation complete. Total items saved: ${savedItems.length}`);
        
        // Fetch the complete order with items and payment
        const completeOrder = await transactionalEntityManager.findOne(Order, {
          where: { id: savedOrder.id },
          relations: ['items', 'payments'],
        });
        
        // Return both order and payment data
        return { 
          data: completeOrder 
        };
      } catch (error) {
        // Log the error but rethrow for proper error handling
        console.error('Error in order creation transaction:', error);
        throw error;
      }
    });
  }

  // Add this method to calculate the total amount from order items
  private calculateTotalAmount(items: any[]): number {
    if (!items || !Array.isArray(items)) return 0;
    
    console.log("Calculating total amount from:", items);
    
    return items.reduce((total, item) => {
      // For weight-based items, use weight property if available
      if (item.weightBased) {
        // Use weight property if available, otherwise use quantity
        const weight = parseFloat(String(item.weight || item.quantity || 0.5).replace(',', '.'));
        const price = parseFloat(String(item.price || 0).replace(',', '.'));
        const itemTotal = price * weight;
        console.log(`Weight-based item subtotal: Price ${price} × Weight ${weight} = ${itemTotal}`);
        return total + Number(itemTotal);
      }
      
      // For piece-based items, use quantity
      const quantity = parseInt(String(item.quantity || 1));
      const price = parseFloat(String(item.price || 0).replace(',', '.'));
      const itemTotal = price * quantity;
      console.log(`Piece-based item subtotal: Price ${price} × Quantity ${quantity} = ${itemTotal}`);
      
      return total + Number(itemTotal);
    }, 0);
  }

  async findAll({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: OrderStatus }): Promise<{ items: Order[]; total: number; page: number; limit: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'orderItems')
      .leftJoinAndSelect('orderItems.service', 'service')
      .select([
        'order',
        'customer',
        'orderItems.id',
        'orderItems.orderId',
        'orderItems.serviceId',
        'orderItems.serviceName',
        'orderItems.quantity',
        'orderItems.weight',
        'orderItems.unitPrice',
        'orderItems.totalPrice',
        'orderItems.createdAt',
        'orderItems.updatedAt',
        'service'
      ]);
    
    if (status) {
      query.andWhere('order.status = :status', { status });
    }
    
    const [items, total] = await query
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.service', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['customer', 'items', 'items.service', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Order with order number ${orderNumber} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    
    // Extract items from the DTO to handle them separately
    const { items, ...orderData } = updateOrderDto;
    
    // Update the order without items
    this.orderRepository.merge(order, orderData);
    const updatedOrder = await this.orderRepository.save(order);
    
    // Handle items separately if they exist
    if (items && items.length > 0) {
      // Delete existing items
      await this.orderItemRepository.delete({ orderId: id });
      
      // Create new order items
      const orderItems = items.map(item => 
        this.orderItemRepository.create({
          orderId: id,
          serviceId: String(item.serviceId || '00000000-0000-0000-0000-000000000000'), // Ensure serviceId is never null
          serviceName: item.serviceName || `Service ${item.serviceId || 'Unknown'}`,
          quantity: item.quantity,
          price: item.price || 0,
          subtotal: (item.price || 0) * item.quantity,
          unitPrice: item.price || 0,
          totalPrice: (item.price || 0) * item.quantity
        })
      );
      
      // Save new items
      const savedItems = await this.orderItemRepository.save(orderItems);
      updatedOrder.items = savedItems;
    }
    
    return updatedOrder;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    
    order.status = status;
    
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
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
        paymentMethod: PaymentMethod.CASH, // Use enum value
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