import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan dashboard' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan data ringkasan' })
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Mendapatkan data grafik pendapatan' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan data grafik pendapatan' })
  async getRevenueChart(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('interval') interval: 'daily' | 'monthly' = 'monthly',
  ) {
    return this.dashboardService.getRevenueChart({ startDate, endDate, interval });
  }

  @Get('service-distribution')
  @ApiOperation({ summary: 'Mendapatkan distribusi layanan' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan data distribusi layanan' })
  async getServiceDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getServiceDistribution({ startDate, endDate });
  }

  @Get('order-status-distribution')
  @ApiOperation({ summary: 'Mendapatkan distribusi status pesanan' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan data distribusi status pesanan' })
  async getOrderStatusDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getOrderStatusDistribution({ startDate, endDate });
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Mendapatkan data pelanggan teratas' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan data pelanggan teratas' })
  async getTopCustomers(@Query('limit') limit = 5) {
    return this.dashboardService.getTopCustomers(limit);
  }
} 