import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, Put, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ items: Order[]; total: number; page: number; limit: number }> {
    return this.orderService.findAll({ page, limit });
  }

  @Get('create-form')
  async getCreateForm() {
    return { message: 'Order creation form data' };
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.orderService.remove(id);
  }
} 