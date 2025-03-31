import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DeepPartial } from 'typeorm';
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
      
      // Create order entity
      const orderData: DeepPartial<Order> = {
        id: orderId,
        orderNumber,
        customerId: createOrderDto.customerId,
        status: OrderStatus.NEW,
        totalAmount,
        totalWeight: 0, // Initialize to 0, we'll calculate from weight-based items
        notes: createOrderDto.notes || '',
        specialRequirements: createOrderDto.specialRequirements || '',
        pickupDate: createOrderDto.pickupDate || null,
        deliveryDate: createOrderDto.deliveryDate || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Calculate totalWeight from weight-based items
      if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
        const totalWeight = createOrderDto.items.reduce((sum, item) => {
          if (item.weightBased) {
            // Use weight property if available, otherwise use quantity
            const weight = parseFloat(String(item.weight || item.quantity || '0').replace(',', '.'));
            return sum + (isNaN(weight) ? 0 : weight);
          }
          return sum;
        }, 0);
        
        // Set the calculated total weight without any rounding
        orderData.totalWeight = totalWeight;
        console.log(`Calculated total weight for order: ${totalWeight} kg`);
      }
      
      console.log('Creating order with data:', JSON.stringify(orderData));
      const order = this.orderRepository.create(orderData);
      
      // Save order FIRST before creating order items
      console.log('Saving order to database...');
      const savedOrder = await this.orderRepository.save(order);
      console.log('Order saved successfully with ID:', savedOrder.id);
      
      // AFTER saving the order, now create order items
      let items: any[] = [];
      if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
        console.log('Processing order items:', JSON.stringify(createOrderDto.items));
        
        for (const item of createOrderDto.items) {
          // Get weightBased property but remove it from what goes to DB
          const { weightBased, ...itemData } = item as any;
          
          try {
            // Look up the service name if not provided
            let serviceName = itemData.serviceName;
            if (!serviceName && itemData.serviceId) {
              try {
                // Try to get the service name from the service repository
                // Convert to string for UUID type compatibility
                const serviceId = String(itemData.serviceId);
                const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
                if (service) {
                  serviceName = service.name;
                  console.log(`Found service name from database: ${serviceName} for ID: ${serviceId}`);
                }
              } catch (serviceError) {
                console.error(`Error finding service name for ID ${itemData.serviceId}:`, serviceError);
                // Fallback to generic name if lookup fails
                serviceName = `Service ${itemData.serviceId}`;
              }
            }
            
            // Handle quantity differently based on whether it's weight-based or piece-based
            let quantity: number;
            let actualQuantity: number;
            
            if (weightBased) {
              // For weight-based items, use weight property if available, otherwise use quantity
              const rawWeight = parseFloat(String(itemData.weight || itemData.quantity || 0.5).replace(',', '.'));
              // Ensure we have at least 0.1 kg for weight-based items
              const itemWeight = Math.max(rawWeight, 0.1);
              
              // For weight-based items, store weight in the weight field and quantity=1
              quantity = 1; // Set quantity to 1 for compatibility
              
              // Update order's totalWeight with this item's weight
              savedOrder.totalWeight = Number((parseFloat(savedOrder.totalWeight.toString()) + itemWeight).toFixed(2));
              await this.orderRepository.save(savedOrder);
              
              console.log(`Processing WEIGHT-BASED item: ${rawWeight} kg → ${itemWeight} kg (stored as weight)`);
              console.log(`Updated order totalWeight to: ${savedOrder.totalWeight} kg`);
              
              // Calculate subtotal based on weight
              const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
              const subtotal = price * itemWeight;
              
              // Use raw query with explicit type casting for PostgreSQL to ensure decimal handling
              const result = await this.orderItemRepository.query(
                `INSERT INTO order_items 
                (order_id, service_id, service_name, quantity, weight, price, subtotal, unit_price, total_price, notes, created_at, updated_at) 
                VALUES($1, $2, $3, $4::decimal, $5::decimal, $6::decimal, $7::decimal, $8::decimal, $9::decimal, $10, NOW(), NOW()) 
                RETURNING *`,
                [
                  savedOrder.id, 
                  String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'), // Ensure serviceId is never null
                  serviceName,
                  quantity.toString(), // Quantity is 1 for weight-based items
                  itemWeight.toString(),   // Weight is the actual weight in kg
                  price.toString(),
                  subtotal.toString(),
                  price.toString(),
                  subtotal.toString(),
                  `Weight: ${itemWeight} kg`
                ]
              );
              
              console.log(`Created weight-based item using raw query:`, result && result[0] ? result[0] : 'No result');
              
              if (result && result.length > 0) {
                // Convert the result to an OrderItem entity
                const savedItem = this.orderItemRepository.create(result[0]);
                items.push(savedItem);
              }
            } else {
              // For piece-based items, use integer with minimum of 1
              const parsedQuantity = parseInt(String(itemData.quantity || 1));
              quantity = Math.max(parsedQuantity, 1); // Ensure at least 1 piece
              actualQuantity = quantity; // Same as quantity for pieces
              console.log(`Processing PIECE-BASED item: ${quantity} pcs`);
              
              const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
              const subtotal = price * quantity;
              
              // For standard piece-based items use the normal approach
              const orderItem = this.orderItemRepository.create({
                orderId: savedOrder.id,
                serviceId: String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'), // Ensure serviceId is never null
                serviceName: serviceName,
                quantity,
                price,
                subtotal,
                unitPrice: price,
                totalPrice: subtotal,
                notes: null
              });
              
              // Save piece-based item
              const savedItem = await this.orderItemRepository.save(orderItem);
              console.log(`Saved piece-based item:`, savedItem);
              items.push(savedItem);
            }
          } catch (itemError) {
            console.error(`Error saving order item:`, itemError);
            throw new BadRequestException(`Failed to create order item: ${itemError.message}`);
          }
        }
        
        // Set the items in the saved order
        savedOrder.items = items;
      }
      
      // Create payment record if payment information is provided
      if (createOrderDto.payment) {
        try {
          console.log('Creating payment record with data:', JSON.stringify(createOrderDto.payment));
          const paymentId = uuidv4();
          const payment = this.paymentRepository.create({
            id: paymentId,
            orderId: savedOrder.id,
            customerId: savedOrder.customerId,
            amount: createOrderDto.payment.amount,
            paymentMethod: createOrderDto.payment.method,
            status: PaymentStatus.COMPLETED,
            notes: `Payment for order ${savedOrder.orderNumber}`,
            transactionId: `CHANGE-${createOrderDto.payment.change}`
          });
          
          await this.paymentRepository.save(payment);
          console.log('Payment record created successfully with ID:', payment.id);
        } catch (paymentError) {
          console.error('Error creating payment record:', paymentError);
          // Don't fail the whole order if payment creation fails
        }
      }
      
      // Return with correct format
      return { data: savedOrder };
    } catch (error) {
      console.error(`Error creating order:`, error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
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