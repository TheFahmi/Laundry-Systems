import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
      const { startDate, endDate, reportType = ReportType.DAILY } = dto;
      const dateRange = this.getDateRange(startDate, endDate, reportType);

      const orders = await this.orderRepository.find({
        where: {
          createdAt: Between(dateRange.start, dateRange.end),
        },
        relations: ['items', 'items.service'],
      });

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
      const totalRevenue = orders.reduce((sum, order) => sum + this.calculateOrderTotal(order), 0);
      const totalWeight = orders.reduce((sum, order) => sum + this.calculateOrderWeight(order), 0);
      const averageOrderValue = Math.round(totalRevenue / totalOrders);

      const topServices = await this.getTopServices(orders);
      const dailyRevenue = await this.getDailyRevenue(orders, dateRange.start, dateRange.end);

      return {
        period: {
          start: dateRange.start,
          end: dateRange.end,
        },
        totalOrders,
        totalRevenue,
        totalWeight,
        averageOrderValue,
        topServices,
        dailyRevenue,
      };
    } catch (error) {
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
    return order.items.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
  }

  private calculateOrderWeight(order: Order): number {
    return order.items.reduce((sum, item) => {
      if (item.service?.priceModel === 'per_kg') {
        return sum + (item.weight || 0);
      }
      return sum;
    }, 0);
  }

  private async getTopServices(orders: Order[]): Promise<TopService[]> {
    try {
      const serviceMap = new Map<string, { orders: number; revenue: number; weight: number }>();

      orders.forEach(order => {
        order.items.forEach(item => {
          const serviceName = item.service?.name || 'Unknown Service';
          const current = serviceMap.get(serviceName) || { orders: 0, revenue: 0, weight: 0 };
          
          serviceMap.set(serviceName, {
            orders: current.orders + 1,
            revenue: current.revenue + (item.subtotal || 0),
            weight: current.weight + (item.service?.priceModel === 'per_kg' ? (item.weight || 0) : 0),
          });
        });
      });

      return Array.from(serviceMap.entries())
        .map(([serviceName, stats]) => ({
          serviceName,
          totalOrders: stats.orders,
          totalRevenue: stats.revenue,
          totalWeight: stats.weight,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
    } catch (error) {
      throw new InternalServerErrorException('Failed to calculate top services');
    }
  }

  private async getDailyRevenue(orders: Order[], startDate: Date, endDate: Date): Promise<DailyRevenue[]> {
    try {
      const dailyStatsMap = new Map<string, { revenue: number; orders: number; weight: number }>();
      let currentDate = startDate;

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyStatsMap.set(dateKey, { revenue: 0, orders: 0, weight: 0 });
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      orders.forEach(order => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        const currentStats = dailyStatsMap.get(dateKey) || { revenue: 0, orders: 0, weight: 0 };
        
        dailyStatsMap.set(dateKey, {
          revenue: currentStats.revenue + this.calculateOrderTotal(order),
          orders: currentStats.orders + 1,
          weight: currentStats.weight + this.calculateOrderWeight(order),
        });
      });

      return Array.from(dailyStatsMap.entries())
        .map(([date, stats]) => ({
          date,
          revenue: stats.revenue,
          orders: stats.orders,
          weight: stats.weight,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      throw new InternalServerErrorException('Failed to calculate daily revenue');
    }
  }
} 