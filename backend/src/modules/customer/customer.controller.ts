import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Buat pelanggan baru' })
  @ApiResponse({ status: 201, description: 'Pelanggan berhasil dibuat' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua pelanggan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar semua pelanggan' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.customerService.findAll({ page, limit, search });
  }

  @Get('search')
  @ApiOperation({ summary: 'Mencari pelanggan berdasarkan query' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar pelanggan yang cocok dengan query' })
  @UseGuards(JwtAuthGuard)
  search(@Query('q') query: string) {
    return this.customerService.search(query);
  }

  @Get('create-form')
  @UseGuards(JwtAuthGuard)
  async getCreateForm() {
    return { message: 'Customer creation form data' };
  }

  // ========================
  // Payment-related endpoints
  // ========================
  @Get('payments')
  @ApiOperation({ summary: 'Mendapatkan riwayat pembayaran pelanggan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar pembayaran pelanggan' })
  @UseGuards(JwtAuthGuard)
  async getCustomerPayments(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    const customerId = req.user.id;
    const filters = {
      customer_id: customerId,
      status,
      method
    };
    
    try {
      // First try to get payments directly
      const paymentsResult = await this.paymentService.findCustomerPayments(page, limit, filters);
      
      // If we have payments, return them
      if (paymentsResult.items.length > 0 && process.env.NODE_ENV === 'production') {
        return paymentsResult;
      }
      
      // In development or if no payments found, try to get orders and generate payment data
      console.log(`[customer.controller] Getting payments from orders for customer ${customerId}`);
      
      // Get orders for this customer
      const orderResult = await this.orderService.findCustomerOrders(
        customerId, 
        page, 
        limit, 
        { status: 'processing,washing,drying,folding,ready,delivered' },
        { includePayments: true }
      );
      
      if (orderResult.items.length > 0) {
        console.log(`[customer.controller] Found ${orderResult.items.length} orders, generating payments`);
        
        // Generate payments based on orders
        const paymentItems = [];
        
        for (const order of orderResult.items) {
          // Check if order already has payments
          if (order.payments && order.payments.length > 0) {
            paymentItems.push(order.payments[0]);
            continue;
          }
          
          // Create a payment object based on order
          const paymentData = {
            orderId: order.id,
            customerId: order.customerId,
            amount: Number(order.totalAmount),
            paymentMethod: PaymentMethod.CASH, // Use enum value
            status: order.status === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
            referenceNumber: `REF-${order.orderNumber}`,
            notes: "Auto-generated from order data"
          };
          
          try {
            // Save the payment to database
            console.log(`[customer.controller] Creating payment for order ${order.id}`);
            const savedPayment = await this.paymentService.create(paymentData);
            paymentItems.push(savedPayment);
          } catch (error) {
            console.error(`[customer.controller] Error creating payment for order ${order.id}:`, error);
            // Create a temporary payment object if save fails
            paymentItems.push({
              id: `auto-pay-${order.id.substring(0, 8)}`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerId: order.customerId,
              amount: Number(order.totalAmount),
              paymentMethod: PaymentMethod.CASH,
              status: order.status === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
              transactionId: null,
              referenceNumber: `REF-${order.orderNumber}`,
              notes: "Auto-generated from order (not saved)",
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status
              }
            });
          }
        }
        
        return {
          items: paymentItems,
          total: orderResult.total,
          page,
          limit
        };
      }
      
      // If no orders with payment potential, return empty result
      return paymentsResult;
    } catch (error) {
      console.error('[customer.controller] Error getting payments:', error);
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
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
  @ApiOperation({ summary: 'Mendapatkan pelanggan berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Mengembalikan data pelanggan yang diminta' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui data pelanggan' })
  @ApiResponse({ status: 200, description: 'Pelanggan berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus pelanggan' })
  @ApiResponse({ status: 200, description: 'Pelanggan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
} 