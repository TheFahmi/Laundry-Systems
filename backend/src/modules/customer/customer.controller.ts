import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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