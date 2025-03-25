import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Payment, PaymentMethod, PaymentStatus } from '../../models/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pembayaran baru' })
  @ApiResponse({ status: 201, description: 'Pembayaran berhasil dibuat' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua data pembayaran' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar semua pembayaran' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    page = page ? parseInt(page.toString()) : 1;
    limit = limit ? parseInt(limit.toString()) : 10;
    return this.paymentService.findAll({ page, limit, status, method });
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Mendapatkan pembayaran berdasarkan ID pesanan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar pembayaran untuk pesanan yang diminta' })
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan pembayaran berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Mengembalikan data pembayaran yang diminta' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui data pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
} 