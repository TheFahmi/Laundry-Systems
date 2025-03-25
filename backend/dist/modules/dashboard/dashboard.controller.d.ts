import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): unknown;
    getRevenueChart(startDate?: string, endDate?: string, interval?: 'daily' | 'monthly'): unknown;
    getServiceDistribution(startDate?: string, endDate?: string): unknown;
    getOrderStatusDistribution(startDate?: string, endDate?: string): unknown;
    getTopCustomers(limit?: number): unknown;
}
