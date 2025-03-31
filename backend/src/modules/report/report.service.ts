import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Service } from '../service/entities/service.entity';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid, parseISO } from 'date-fns';

export interface TopService {
  serviceName: string;
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  weight: number;
}

export interface ReportResponse {
  period: {
    start: Date;
    end: Date;
  };
  totalOrders: number;
  totalRevenue: number;
  totalWeight: number;
  averageOrderValue: number;
  topServices: TopService[];
  dailyRevenue: DailyRevenue[];
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async generateReport(dto: GenerateReportDto): Promise<ReportResponse> {
    try {
      this.logger.log(`Generating report with params: ${JSON.stringify(dto)}`);
      const { startDate, endDate, reportType = ReportType.DAILY } = dto;
      const dateRange = this.getDateRange(startDate, endDate, reportType);
      
      this.logger.debug(`Date range: ${dateRange.start.toISOString()} to ${dateRange.end.toISOString()}`);

      // Find orders in date range with items and related services
      const orders = await this.orderRepository.find({
        where: {
          createdAt: Between(dateRange.start, dateRange.end),
        },
        relations: ['items', 'items.service'],
      });
      
      this.logger.debug(`Found ${orders.length} orders in the date range`);

      if (!orders.length) {
        return {
          period: {
            start: dateRange.start,
            end: dateRange.end,
          },
          totalOrders: 0,
          totalRevenue: 0,
          totalWeight: 0,
          averageOrderValue: 0,
          topServices: [],
          dailyRevenue: [],
        };
      }

      const totalOrders = orders.length;
      
      // Calculate totals safely
      let totalRevenue = 0;
      let totalWeight = 0;
      
      // Process each order
      orders.forEach(order => {
        const orderTotal = this.calculateOrderTotal(order);
        const orderWeight = this.calculateOrderWeight(order);
        
        // Add to totals, ensuring valid numbers
        totalRevenue += isNaN(orderTotal) ? 0 : orderTotal;
        totalWeight += isNaN(orderWeight) ? 0 : orderWeight;
      });
      
      this.logger.debug(`Calculated totals: Orders=${totalOrders}, Revenue=${totalRevenue}, Weight=${totalWeight}`);
      
      // Calculate average order value, avoiding division by zero
      const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

      const topServices = await this.getTopServices(orders);
      const dailyRevenue = await this.getDailyRevenue(orders, dateRange.start, dateRange.end);

      this.logger.debug('Report data preparation completed successfully');
      
      // Ensure all values are numbers, not strings
      return {
        period: {
          start: dateRange.start,
          end: dateRange.end,
        },
        totalOrders: Number(totalOrders),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalWeight: Number(totalWeight.toFixed(2)),
        averageOrderValue: Number(averageOrderValue),
        topServices: topServices.map(service => ({
          serviceName: service.serviceName,
          totalOrders: Number(service.totalOrders),
          totalRevenue: Number(service.totalRevenue.toFixed(2)),
          totalWeight: Number(service.totalWeight.toFixed(2))
        })),
        dailyRevenue: dailyRevenue.map(day => ({
          date: day.date,
          revenue: Number(day.revenue.toFixed(2)),
          orders: Number(day.orders),
          weight: Number(day.weight.toFixed(2))
        })),
      };
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  private getDateRange(startDate?: string, endDate?: string, reportType: ReportType = ReportType.DAILY) {
    const now = new Date();

    if (reportType === ReportType.CUSTOM) {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required for custom reports');
      }

      const parsedStartDate = parseISO(startDate);
      const parsedEndDate = parseISO(endDate);

      if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
        throw new BadRequestException('Invalid date format. Please use ISO 8601 format (e.g., 2024-03-01T00:00:00Z)');
      }

      if (parsedStartDate > parsedEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      return {
        start: startOfDay(parsedStartDate),
        end: endOfDay(parsedEndDate),
      };
    }

    switch (reportType) {
      case ReportType.DAILY:
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case ReportType.WEEKLY:
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case ReportType.MONTHLY:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      default:
        throw new BadRequestException('Invalid report type');
    }
  }

  private calculateOrderTotal(order: Order): number {
    try {
      if (!order.items || !Array.isArray(order.items)) {
        this.logger.warn(`Order ${order.id} has no items or items is not an array`);
        return 0;
      }
      
      return order.items.reduce((sum, item) => {
        // Handle possible undefined or null values
        if (!item) return sum;
        
        // Use subtotal if available (already calculated), otherwise calculate from price * quantity
        const itemValue = item.subtotal || (item.price * item.quantity) || 0;
        return sum + Number(itemValue);
      }, 0);
    } catch (error) {
      this.logger.warn(`Error calculating order total for order ${order.id}: ${error.message}`);
      return 0;
    }
  }

  private calculateOrderWeight(order: Order): number {
    try {
      if (!order.items || !Array.isArray(order.items)) {
        return 0;
      }
      
      return order.items.reduce((sum, item) => {
        // Handle possible undefined or null values
        if (!item) return sum;
        
        const itemWeight = item.weight || 0;
        return sum + Number(itemWeight);
      }, 0);
    } catch (error) {
      this.logger.warn(`Error calculating order weight for order ${order.id}: ${error.message}`);
      return 0;
    }
  }

  private async getTopServices(orders: Order[]): Promise<TopService[]> {
    try {
      const serviceMap = new Map<string, TopService>();
  
      orders.forEach(order => {
        if (!order.items || !Array.isArray(order.items)) return;
        
        order.items.forEach(item => {
          if (!item) return;
          
          // Get service name, with fallback for null/undefined service
          const serviceName = item.service?.name || item.serviceName || 'Unknown Service';
          
          if (!serviceMap.has(serviceName)) {
            serviceMap.set(serviceName, {
              serviceName,
              totalOrders: 0,
              totalRevenue: 0,
              totalWeight: 0,
            });
          }
  
          const stat = serviceMap.get(serviceName);
          stat.totalOrders += 1;
          
          // Use subtotal if available, otherwise calculate
          const itemRevenue = item.subtotal || (item.price * item.quantity) || 0;
          stat.totalRevenue += Number(itemRevenue);
          
          const itemWeight = item.weight || 0;
          stat.totalWeight += Number(itemWeight);
        });
      });
  
      this.logger.debug(`Found ${serviceMap.size} unique services for the report`);
      
      return Array.from(serviceMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5); // Top 5 services
    } catch (error) {
      this.logger.error(`Error getting top services: ${error.message}`, error.stack);
      return [];
    }
  }

  private async getDailyRevenue(orders: Order[], startDate: Date, endDate: Date): Promise<DailyRevenue[]> {
    try {
      const days: DailyRevenue[] = [];
      
      // Create array of all dates in range
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        days.push({
          date: currentDate.toISOString().split('T')[0],
          revenue: 0,
          orders: 0,
          weight: 0,
        });
        
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Fill in data for days with orders
      orders.forEach(order => {
        if (!order.createdAt) return;
        
        const orderDate = new Date(order.createdAt);
        const dateString = orderDate.toISOString().split('T')[0];
        
        const dayData = days.find(day => day.date === dateString);
        if (dayData) {
          dayData.orders += 1;
          
          const orderRevenue = this.calculateOrderTotal(order);
          const orderWeight = this.calculateOrderWeight(order);
          
          dayData.revenue += isNaN(orderRevenue) ? 0 : orderRevenue;
          dayData.weight += isNaN(orderWeight) ? 0 : orderWeight;
        }
      });
      
      this.logger.debug(`Prepared daily revenue data for ${days.length} days`);
      return days;
    } catch (error) {
      this.logger.error(`Error getting daily revenue: ${error.message}`, error.stack);
      return [];
    }
  }
} 