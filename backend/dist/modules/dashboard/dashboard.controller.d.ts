import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<import("./dashboard.service").DashboardSummary>;
    getRevenueChart(startDate?: string, endDate?: string, interval?: 'daily' | 'monthly'): Promise<import("./dashboard.service").RevenueChartData[]>;
    getServiceDistribution(startDate?: string, endDate?: string): Promise<import("./dashboard.service").ServiceDistribution[]>;
    getOrderStatusDistribution(startDate?: string, endDate?: string): Promise<import("./dashboard.service").OrderStatusDistribution[]>;
    getTopCustomers(limit?: number): Promise<import("./dashboard.service").TopCustomer[]>;
}
