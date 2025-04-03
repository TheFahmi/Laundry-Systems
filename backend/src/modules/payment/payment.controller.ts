import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, ValidationPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Returns all payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'order_id', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order_id') orderId?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    const filters = {
      order_id: orderId,
      status,
      method
    };
    
    return this.paymentService.findAll(+page, +limit, filters);
  }

  @Get('customer')
  @ApiOperation({ summary: 'Get payments for the current customer' })
  @ApiResponse({ status: 200, description: 'Returns customer payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  async findCustomerPayments(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    const customerId = req.user.id;
    const filters = {
      customer_id: customerId,
      status,
      method
    };
    
    return this.paymentService.findCustomerPayments(+page, +limit, filters);
  }

  @Get('customer/order/:orderId')
  @ApiOperation({ summary: 'Get all payments for a specific order for the current customer' })
  @ApiResponse({ status: 200, description: 'Returns order payments' })
  async findOrderPayments(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    return this.paymentService.findOrderPayments(orderId, req.user.id);
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