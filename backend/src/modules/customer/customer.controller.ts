import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/entities/order.entity';
import { PaymentMethod, PaymentStatus } from '../payment/entities/payment.entity';

/**
 * Customer Controller
 * 
 * IMPORTANT: Route Order Matters!
 * Routes are matched in the order they are defined.
 * More specific routes (like 'payments' or 'orders') must be defined BEFORE
 * generic parameter routes (like ':id') to prevent conflicts.
 */
@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully', type: Customer })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Returns all customers', type: [Customer] })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string
  ) {
    return this.customerService.findAll({ page, limit, search });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by name or phone' })
  @ApiResponse({ status: 200, description: 'Returns matching customers', type: [Customer] })
  search(@Query('q') query: string) {
    return this.customerService.search(query);
  }

  @Get('create-form')
  @UseGuards(JwtAuthGuard)
  async getCreateForm() {
    return { message: 'Customer creation form data' };
  }

  /**
   * Get customer payment details by ID
   */
  @Get('payments/:id')
  @ApiOperation({ summary: 'Get customer payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: Object
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getCustomerPaymentById(
    @Req() req,
    @Param('id') paymentId: string
  ) {
    console.log(`[customer.controller] Fetching payment details for ID: ${paymentId}`);
    // First check if the payment exists at all, regardless of customer
    let paymentExists = false;
    let payment;
    
    try {
      // Try to find the payment directly without customer filter first
      payment = await this.paymentService.findOneWithoutCustomerCheck(paymentId);
      if (payment) {
        paymentExists = true;
        console.log(`[customer.controller] Payment ${paymentId} exists in database`);
      }
    } catch (error) {
      console.log(`[customer.controller] Error checking if payment exists: ${error.message}`);
    }
    
    const customerId = req.user.id;
    console.log(`[customer.controller] Customer ID from request: ${customerId}`);
    
    // Try to find the payment with customer check
    try {
      payment = await this.paymentService.findOne(paymentId, { 
        role: 'customer', 
        id: customerId 
      });
      
      if (payment) {
        console.log(`[customer.controller] Payment ${paymentId} found for customer ${customerId}`);
        // If payment found, return it with formatted fields
        return {
          ...payment,
          paymentMethod: payment.paymentMethod?.toLowerCase() || 'cash',
          status: payment.status?.toLowerCase() || 'pending',
          transactionId: payment.transactionId || '',
          notes: payment.notes || ''
        };
      }
    } catch (error) {
      console.error(`[customer.controller] Error finding payment ${paymentId} for customer ${customerId}:`, error);
    }
    
    // If payment not found directly, check if it's associated with customer's orders
    try {
      console.log(`[customer.controller] Searching for payment ${paymentId} in customer orders`);
      // Find all orders with payments included
      const { items: orders } = await this.orderService.findAll({
        page: 1,
        limit: 100,
        include_payments: true
      });
      
      // Filter orders for this customer manually
      const customerOrders = orders.filter(order => order.customerId === customerId);
      console.log(`[customer.controller] Found ${customerOrders.length} orders for customer ${customerId}`);
      
      // Look through all orders to find the payment
      for (const order of customerOrders) {
        if (order.payments && order.payments.length > 0) {
          const foundPayment = order.payments.find(p => p.id === paymentId);
          
          if (foundPayment) {
            console.log(`[customer.controller] Found payment ${paymentId} in order ${order.id}`);
            // If no customerId on payment, update it
            if (!foundPayment.customerId) {
              try {
                console.log(`[customer.controller] Updating payment ${paymentId} with customerId ${customerId}`);
                await this.paymentService.update(paymentId, { customerId }, req.user);
              } catch (updateError) {
                console.error(`[customer.controller] Error updating payment customerId:`, updateError);
              }
            }
            
            // Format and return the payment with order info
            return {
              ...foundPayment,
              customerId,
              paymentMethod: foundPayment.paymentMethod?.toLowerCase() || 'cash',
              status: foundPayment.status?.toLowerCase() || 'pending',
              transactionId: foundPayment.transactionId || '',
              notes: foundPayment.notes || '',
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status?.toLowerCase() || 'pending'
              }
            };
          }
        }
      }
      
      console.log(`[customer.controller] Payment ${paymentId} not found in any customer orders`);
    } catch (error) {
      console.error(`[customer.controller] Error searching for payment in orders:`, error);
    }
    
    // Special case: if payment exists but doesn't belong to this customer
    if (paymentExists) {
      // Assign payment to this customer if it doesn't have a customer already
      if (payment && !payment.customerId) {
        try {
          console.log(`[customer.controller] Payment exists but has no customer, assigning to ${customerId}`);
          await this.paymentService.update(paymentId, { customerId }, req.user);
          
          // Return the payment with the updated customer ID
          return {
            ...payment,
            customerId,
            paymentMethod: payment.paymentMethod?.toLowerCase() || 'cash',
            status: payment.status?.toLowerCase() || 'pending',
            transactionId: payment.transactionId || '',
            notes: payment.notes || ''
          };
        } catch (error) {
          console.error(`[customer.controller] Error assigning payment to customer:`, error);
        }
      } else {
        console.log(`[customer.controller] Payment exists but belongs to a different customer`);
        throw new ForbiddenException(`Payment with ID ${paymentId} belongs to another customer`);
      }
    }
    
    // Payment not found
    throw new NotFoundException(`Payment with ID ${paymentId} not found or does not belong to this customer`);
  }

  /**
   * Get customer's payment history
   */
  @Get('payments')
  @ApiOperation({ summary: 'Get customer payment history' })
  @ApiResponse({ status: 200, description: 'Returns customer payment history', type: [Object] })
  async getCustomerPayments(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    const customerId = req.user.id;
    
    console.log(`[customer.controller] Fetching payments for customer ${customerId}`);
    console.log(`[customer.controller] Params: page=${page}, limit=${limit}, status=${status}, method=${method}`);
    
    // Empty response structure
    const result = {
      items: [],
      total: 0,
      page,
      limit
    };
    
    try {
      // Find payments for this customer
      const paymentsResult = await this.paymentService.findCustomerPayments(
        page,
        limit,
        {
          customer_id: customerId,
          status,
          method
        }
      );
      
      if (paymentsResult.items.length > 0) {
        console.log(`[customer.controller] Found ${paymentsResult.items.length} payments for customer ${customerId}`);
        return paymentsResult;
      }
      
      console.log(`[customer.controller] No payments found for customer ${customerId}, checking orders`);
      
      // No payments found directly, try to find from orders
      const orderResult = await this.orderService.findAll({
        page: 1,
        limit: 100,
        status: status as OrderStatus
      });
      
      console.log(`[customer.controller] Found ${orderResult.items.length} orders for customer, checking for payments`);
      
      // Filter for this customer's orders only
      orderResult.items = orderResult.items.filter(order => order.customerId === customerId);
      
      if (orderResult.items.length > 0) {
        console.log(`[customer.controller] Found ${orderResult.items.length} orders, generating payments`);
        
        // Generate payments based on orders
        const paymentItems = [];
        const existingPayments = paymentsResult.items || [];
        
        // Create a map of existing payments by orderId for quick lookup
        const existingPaymentMap = new Map();
        for (const payment of existingPayments) {
          existingPaymentMap.set(payment.orderId, payment);
        }
        
        for (const order of orderResult.items) {
          // Check if this order already has a payment in our result
          if (existingPaymentMap.has(order.id)) {
            paymentItems.push(existingPaymentMap.get(order.id));
            continue;
          }
          
          // Check if order already has payments from the relation
          if (order.payments && order.payments.length > 0) {
            // Ensure the payment has customerId
            const existingPayment = order.payments[0];
            if (!existingPayment.customerId && order.customerId) {
              existingPayment.customerId = order.customerId;
              try {
                await this.paymentService.update(existingPayment.id, { customerId: order.customerId }, req.user);
              } catch (error) {
                console.error(`[customer.controller] Error updating payment ${existingPayment.id} with customerId:`, error);
              }
            }
            
            // Format the existing payment to match frontend expectations
            const formattedPayment = {
              ...existingPayment,
              paymentMethod: existingPayment.paymentMethod?.toLowerCase() || 'cash',
              status: existingPayment.status?.toLowerCase() || 'pending',
              transactionId: existingPayment.transactionId || '',
              notes: existingPayment.notes || '',
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status?.toLowerCase() || 'pending'
              }
            };
            
            paymentItems.push(formattedPayment);
            continue;
          }
          
          // Create a payment object based on order
          const paymentData = {
            orderId: order.id,
            customerId: order.customerId,
            amount: Number(order.totalAmount),
            paymentMethod: PaymentMethod.CASH, // Use enum value
            status: order.status === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
            referenceNumber: `REF-ORD-${order.orderNumber.substring(order.orderNumber.length - 7)}`,
            notes: "Auto-generated from order data"
          };
          
          try {
            // Save the payment to database
            console.log(`[customer.controller] Creating payment for order ${order.id}`);
            const savedPayment = await this.paymentService.create(paymentData);
            
            // Format the saved payment
            const formattedPayment = {
              ...savedPayment,
              paymentMethod: savedPayment.paymentMethod?.toLowerCase() || 'cash',
              status: savedPayment.status?.toLowerCase() || 'pending',
              transactionId: savedPayment.transactionId || '',
              notes: savedPayment.notes || '',
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status?.toLowerCase() || 'pending'
              }
            };
            
            paymentItems.push(formattedPayment);
          } catch (error) {
            console.error(`[customer.controller] Error creating payment for order ${order.id}:`, error);
            // Create a temporary payment object if save fails
            paymentItems.push({
              id: `auto-pay-${order.id.substring(0, 8)}`,
              orderId: order.id,
              customerId: order.customerId,
              amount: Number(order.totalAmount),
              paymentMethod: 'cash',
              status: order.status === OrderStatus.DELIVERED ? 'completed' : 'pending',
              transactionId: '',
              referenceNumber: `REF-ORD-${order.orderNumber.substring(order.orderNumber.length - 7)}`,
              notes: "Auto-generated from order data",
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status?.toLowerCase() || 'pending'
              }
            });
          }
        }
        
        // Merge existing payments with new ones, ensuring no duplicates by orderId
        const combinedPayments = [];
        const seenOrderIds = new Set();
        
        // First add all filtered payments
        for (const payment of paymentItems) {
          // Apply method filter if provided
          if (method && payment.paymentMethod.toLowerCase() !== method.toLowerCase()) {
            continue;
          }
          
          combinedPayments.push(payment);
          seenOrderIds.add(payment.orderId);
        }
        
        // Sort by date (newest first)
        combinedPayments.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Apply pagination
        const startIdx = (page - 1) * limit;
        const endIdx = startIdx + limit;
        const paginatedPayments = combinedPayments.slice(startIdx, endIdx);
        
        console.log(`[customer.controller] Returning ${paginatedPayments.length} payments for customer ${customerId}`);
        
        // Return paginated results
        return {
          items: paginatedPayments,
          total: combinedPayments.length,
          page,
          limit
        };
      }
    } catch (error) {
      console.error('[customer.controller] Error fetching customer payments:', error);
    }
    
    console.log(`[customer.controller] No payments found for customer ${customerId}`);
    return result;
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Mendapatkan detail pembayaran' })
  @ApiResponse({ status: 200, description: 'Mengembalikan detail pembayaran' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  getPaymentDetail(@Param('id') id: string, @Req() req) {
    return this.paymentService.findOne(id, req.user);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Membuat pembayaran baru' })
  @ApiResponse({ status: 201, description: 'Pembayaran berhasil dibuat' })
  @UseGuards(JwtAuthGuard)
  createPayment(
    @Body() createPaymentDto: any,
    @Req() req
  ) {
    return this.paymentService.createCustomerPayment(createPaymentDto, req.user.id);
  }

  // =======================
  // Order-related endpoints
  // =======================
  @Get('orders')
  @ApiOperation({ summary: 'Mendapatkan daftar pesanan pelanggan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar pesanan pelanggan' })
  @UseGuards(JwtAuthGuard)
  getCustomerOrders(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('include_payments') includePayments?: string,
  ) {
    const customerId = req.user.id;
    const filters = {
      customer_id: customerId,
      status
    };
    
    const options = {
      includePayments: true // Always include payments
    };
    
    return this.orderService.findCustomerOrders(customerId, page, limit, filters, options);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Mendapatkan detail pesanan pelanggan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan detail pesanan' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  getCustomerOrder(@Param('id') id: string, @Req() req) {
    return this.orderService.findOne(id, req.user);
  }

  @Get('orders/:id/payments')
  @ApiOperation({ summary: 'Mendapatkan daftar pembayaran untuk pesanan tertentu' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar pembayaran untuk pesanan' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  getOrderPayments(
    @Param('id') orderId: string,
    @Req() req
  ) {
    return this.paymentService.findOrderPayments(orderId, req.user);
  }

  // =======================
  // Customer detail endpoints
  // =======================
  // Generic parameter routes must come AFTER all specific routes
  // to avoid path conflicts

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Returns customer details', type: Customer })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer details' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully', type: Customer })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
} 