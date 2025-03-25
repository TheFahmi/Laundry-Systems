export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    interval?: 'daily' | 'monthly';
}
export interface DashboardSummary {
    totalPendapatan: number;
    totalPesanan: number;
    pesananSelesai: number;
    pelangganAktif: number;
}
export interface RevenueChartData {
    tanggal: string;
    pendapatan: number;
}
export interface ServiceDistribution {
    layanan: string;
    jumlah: number;
    persentase: number;
}
export interface OrderStatusDistribution {
    status: string;
    jumlah: number;
    persentase: number;
}
export interface TopCustomer {
    id: string;
    nama: string;
    totalPesanan: number;
    totalNilai: number;
}
export declare class DashboardService {
    getSummary(): Promise<DashboardSummary>;
    getRevenueChart(filters: DashboardFilters): Promise<RevenueChartData[]>;
    getServiceDistribution(filters: DashboardFilters): Promise<ServiceDistribution[]>;
    getOrderStatusDistribution(filters: DashboardFilters): Promise<OrderStatusDistribution[]>;
    getTopCustomers(limit: number): Promise<TopCustomer[]>;
}
