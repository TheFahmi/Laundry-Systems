import { ApiProperty } from '@nestjs/swagger';

export class ReportPeriod {
  @ApiProperty({ description: 'Start date of the report period' })
  start: Date;

  @ApiProperty({ description: 'End date of the report period' })
  end: Date;
}

export class ReportSummary {
  @ApiProperty({ description: 'Total number of orders in the period' })
  totalOrders: number;

  @ApiProperty({ description: 'Total revenue in the period' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total weight processed in the period' })
  totalWeight: number;

  @ApiProperty({ description: 'Average order value in the period' })
  averageOrderValue: number;
}

export class ServiceStat {
  @ApiProperty({ description: 'Name of the service' })
  name: string;

  @ApiProperty({ description: 'Total quantity of orders for this service' })
  totalQuantity: number;

  @ApiProperty({ description: 'Total revenue for this service' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total weight processed for this service' })
  totalWeight: number;
}

export class DailyRevenue {
  @ApiProperty({ description: 'Date of the revenue record' })
  date: string;

  @ApiProperty({ description: 'Revenue amount for the date' })
  revenue: number;
}

export class ReportResponse {
  @ApiProperty({ description: 'Report period details' })
  period: ReportPeriod;

  @ApiProperty({ description: 'Report summary statistics' })
  summary: ReportSummary;

  @ApiProperty({ description: 'Top services statistics', type: [ServiceStat] })
  topServices: ServiceStat[];

  @ApiProperty({ description: 'Daily revenue breakdown', type: [DailyRevenue] })
  dailyRevenue: DailyRevenue[];
} 