import { createAuthHeaders } from '@/lib/api-utils';

// Dashboard summary types
export interface DashboardSummary {
  totalPendapatan: number;
  totalPesanan: number;
  pesananSelesai: number;
  pelangganAktif: number;
}

// Revenue chart types
export interface RevenueChartData {
  tanggal: string;
  pendapatan: number;
}

export interface RevenueChartParams {
  startDate?: string;
  endDate?: string;
  interval?: 'daily' | 'monthly';
}

// Service distribution types
export interface ServiceDistribution {
  layanan: string;
  jumlah: number;
  persentase: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// Order status distribution types
export interface OrderStatusDistribution {
  status: string;
  jumlah: number;
  persentase: number;
}

// Top customer types
export interface TopCustomer {
  id: string;
  nama: string;
  totalPesanan: number;
  totalNilai: number;
}

// Recent activity types
export interface RecentActivity {
  id: number;
  type: 'order' | 'payment' | 'customer' | 'service';
  text: string;
  time: string;
}

// Cache buster for API requests
const generateCacheBuster = () => `_cb=${Date.now()}`;

/**
 * Fetches dashboard summary data
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const headers = createAuthHeaders();
  const response = await fetch(`/api/dashboard/summary?${generateCacheBuster()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch dashboard summary: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetches revenue chart data with optional filters
 */
export async function getRevenueChart(params?: RevenueChartParams): Promise<RevenueChartData[]> {
  const headers = createAuthHeaders();
  const queryParams = new URLSearchParams();
  
  // Add cache buster
  queryParams.append('_cb', Date.now().toString());
  
  // Add optional filters
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.interval) queryParams.append('interval', params.interval);
  
  const response = await fetch(`/api/dashboard/revenue-chart?${queryParams.toString()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch revenue chart: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetches service distribution data with optional date range
 */
export async function getServiceDistribution(params?: DateRangeParams): Promise<ServiceDistribution[]> {
  const headers = createAuthHeaders();
  const queryParams = new URLSearchParams();
  
  // Add cache buster
  queryParams.append('_cb', Date.now().toString());
  
  // Add optional date range
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const response = await fetch(`/api/dashboard/service-distribution?${queryParams.toString()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch service distribution: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetches order status distribution data with optional date range
 */
export async function getOrderStatusDistribution(params?: DateRangeParams): Promise<OrderStatusDistribution[]> {
  const headers = createAuthHeaders();
  const queryParams = new URLSearchParams();
  
  // Add cache buster
  queryParams.append('_cb', Date.now().toString());
  
  // Add optional date range
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const response = await fetch(`/api/dashboard/order-status-distribution?${queryParams.toString()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch order status distribution: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetches top customers data with optional limit
 */
export async function getTopCustomers(limit: number = 5): Promise<TopCustomer[]> {
  const headers = createAuthHeaders();
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    _cb: Date.now().toString() // Cache buster
  });
  
  const response = await fetch(`/api/dashboard/top-customers?${queryParams.toString()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch top customers: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetches recent activity data with optional limit
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const headers = createAuthHeaders();
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    _cb: Date.now().toString() // Cache buster
  });
  
  const response = await fetch(`/api/dashboard/recent-activity?${queryParams.toString()}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch recent activity: ${response.status}`);
  }
  
  return await response.json();
} 