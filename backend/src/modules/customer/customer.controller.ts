import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from '../../models/customer.entity';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pelanggan baru' })
  @ApiResponse({ status: 201, description: 'Pelanggan berhasil dibuat' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua pelanggan' })
  @ApiResponse({ status: 200, description: 'Mengembalikan daftar semua pelanggan' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<any> {
    return this.customerService.findAll({ page, limit });
  }

  @Get('create-form')
  async getCreateForm() {
    return { message: 'Customer creation form data' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan pelanggan berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Mengembalikan data pelanggan yang diminta' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<any> {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui data pelanggan' })
  @ApiResponse({ status: 200, description: 'Pelanggan berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus pelanggan' })
  @ApiResponse({ status: 200, description: 'Pelanggan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Pelanggan tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
} 