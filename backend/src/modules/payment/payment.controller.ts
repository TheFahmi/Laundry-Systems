import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, ValidationPipe, Request, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua pembayaran' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar semua pembayaran' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order_id') order_id?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('customer_id') customer_id?: string,
  ) {
    const filters = {
      order_id,
      status,
      method,
      customer_id
    };
    
    const result = this.paymentService.findAll(page, limit, filters);
    
    // Format response data to ensure consistent casing and field naming
    return result.then(data => {
      // Format items to match frontend expectations
      const formattedItems = data.items.map(item => ({
        ...item,
        paymentMethod: item.paymentMethod?.toLowerCase() || 'cash',
        status: item.status?.toLowerCase() || 'pending',
        transactionId: item.transactionId || '',
        notes: item.notes || '',
        customerId: item.customerId
      }));
      
      return {
        ...data,
        items: formattedItems
      };
    });
  }

  @Get('customer')
  @ApiOperation({ summary: 'Get payments for the current customer' })
  @ApiResponse({ status: 200, description: 'Returns customer payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  @ApiQuery({ name: 'no_mocks', required: false, type: String, description: 'Set to "true" to disable mock data in development mode' })
  async findCustomerPayments(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('no_mocks') noMocks?: string,
  ) {
    const customerId = req.user.id;
    const filters = {
      customer_id: customerId,
      status,
      method,
      no_mocks: noMocks
    };
    
    const result = await this.paymentService.findCustomerPayments(page, limit, filters);
    
    // If no items found, add a message
    if (result.items.length === 0) {
      return {
        ...result,
        message: "Belum Ada Riwayat Pembayaran. Anda belum memiliki riwayat pembayaran. Lakukan pemesanan layanan laundry terlebih dahulu."
      };
    }
    
    // Format response data to ensure consistent field naming and casing
    const formattedItems = result.items.map(item => ({
      ...item,
      paymentMethod: item.paymentMethod?.toLowerCase() || 'cash',
      status: item.status?.toLowerCase() || 'pending',
      transactionId: item.transactionId || '',
      notes: item.notes || '',
      customerId: item.customerId
    }));
    
    return {
      ...result,
      items: formattedItems
    };
  }

  @Get('customer/order/:orderId')
  @ApiOperation({ summary: 'Get all payments for a specific order for the current customer' })
  @ApiResponse({ status: 200, description: 'Returns order payments' })
  async findOrderPayments(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    const result = await this.paymentService.findOrderPayments(orderId, req.user);
    
    // Ensure consistent field formats for frontend
    if (Array.isArray(result)) {
      return result.map(item => ({
        ...item,
        paymentMethod: item.paymentMethod?.toLowerCase() || 'cash',
        status: item.status?.toLowerCase() || 'pending',
        transactionId: item.transactionId || '',
        notes: item.notes || '',
        customerId: item.customerId
      }));
    } else if (result.items) {
      const formattedItems = result.items.map(item => ({
        ...item,
        paymentMethod: item.paymentMethod?.toLowerCase() || 'cash',
        status: item.status?.toLowerCase() || 'pending',
        transactionId: item.transactionId || '',
        notes: item.notes || '',
        customerId: item.customerId
      }));
      
      return {
        ...result,
        items: formattedItems
      };
    }
    
    return result;
  }

  @Get('order/:orderId/pending')
  @ApiOperation({ summary: 'Check if customer has pending payments for an order' })
  @ApiResponse({ status: 200, description: 'Returns pending payment information if any' })
  async checkPendingPaymentForOrder(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    return this.paymentService.findPendingPaymentForOrder(orderId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({ status: 200, description: 'Returns a payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.paymentService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@Body(ValidationPipe) createPaymentDto: CreatePaymentDto, @Request() req) {
    // Add the customer id to the DTO if authenticated as a customer
    if (req.user && req.user.role === 'customer') {
      return this.paymentService.createCustomerPayment(createPaymentDto, req.user.id);
    }
    return this.paymentService.create(createPaymentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePaymentDto: UpdatePaymentDto,
    @Request() req
  ) {
    return this.paymentService.update(id, updatePaymentDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.paymentService.remove(id, req.user);
    return { message: 'Payment deleted successfully' };
  }
} 