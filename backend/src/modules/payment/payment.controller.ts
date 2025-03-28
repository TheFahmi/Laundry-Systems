import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Payment, PaymentMethod, PaymentStatus } from '../../models/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pembayaran baru' })
  @ApiResponse({ status: 201, description: 'Pembayaran berhasil dibuat' })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan pembayaran berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Mengembalikan data pembayaran yang diminta' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui data pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus pembayaran' })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
} 