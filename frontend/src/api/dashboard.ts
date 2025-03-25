import axios from 'axios';
import { API_URL } from '@/config';

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

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  interval?: 'daily' | 'monthly';
}

// Fungsi untuk mendapatkan ringkasan dashboard
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // Coba menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/dashboard/summary`);
      return response.data;
    } catch (backendError) {
      console.warn('Backend dashboard summary failed, using mock data:', backendError);
      
      // Data contoh jika backend tidak tersedia
      return {
        totalPendapatan: 15000000,
        totalPesanan: 120,
        pesananSelesai: 98,
        pelangganAktif: 45
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data grafik pendapatan
export const getRevenueChart = async (filters: DashboardFilters = {}): Promise<RevenueChartData[]> => {
  try {
    // Buat query string dari filter
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.interval) queryParams.append('interval', filters.interval);
    
    // Coba menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/dashboard/revenue-chart?${queryParams}`);
      return response.data;
    } catch (backendError) {
      console.warn('Backend revenue chart failed, using mock data:', backendError);
      
      // Data contoh jika backend tidak tersedia
      return [
        { tanggal: '2023-01', pendapatan: 2500000 },
        { tanggal: '2023-02', pendapatan: 3100000 },
        { tanggal: '2023-03', pendapatan: 2800000 },
        { tanggal: '2023-04', pendapatan: 3300000 },
        { tanggal: '2023-05', pendapatan: 3200000 },
        { tanggal: '2023-06', pendapatan: 3800000 }
      ];
    }
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan distribusi layanan
export const getServiceDistribution = async (filters: DashboardFilters = {}): Promise<ServiceDistribution[]> => {
  try {
    // Buat query string dari filter
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    // Coba menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/dashboard/service-distribution?${queryParams}`);
      return response.data;
    } catch (backendError) {
      console.warn('Backend service distribution failed, using mock data:', backendError);
      
      // Data contoh jika backend tidak tersedia
      return [
        { layanan: 'Cuci Setrika', jumlah: 50, persentase: 41.7 },
        { layanan: 'Cuci Kering', jumlah: 30, persentase: 25 },
        { layanan: 'Setrika', jumlah: 25, persentase: 20.8 },
        { layanan: 'Premium', jumlah: 15, persentase: 12.5 }
      ];
    }
  } catch (error) {
    console.error('Error fetching service distribution:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan distribusi status pesanan
export const getOrderStatusDistribution = async (filters: DashboardFilters = {}): Promise<OrderStatusDistribution[]> => {
  try {
    // Buat query string dari filter
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    // Coba menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/dashboard/order-status-distribution?${queryParams}`);
      return response.data;
    } catch (backendError) {
      console.warn('Backend order status distribution failed, using mock data:', backendError);
      
      // Data contoh jika backend tidak tersedia
      return [
        { status: 'Selesai', jumlah: 98, persentase: 81.7 },
        { status: 'Dalam Proses', jumlah: 15, persentase: 12.5 },
        { status: 'Menunggu', jumlah: 7, persentase: 5.8 }
      ];
    }
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan pelanggan teratas
export const getTopCustomers = async (limit: number = 5): Promise<TopCustomer[]> => {
  try {
    // Coba menggunakan backend
    try {
      const response = await axios.get(`${API_URL}/dashboard/top-customers?limit=${limit}`);
      return response.data;
    } catch (backendError) {
      console.warn('Backend top customers failed, using mock data:', backendError);
      
      // Data contoh jika backend tidak tersedia
      return [
        { id: '1', nama: 'Budi Santoso', totalPesanan: 12, totalNilai: 1200000 },
        { id: '2', nama: 'Siti Nurhaliza', totalPesanan: 10, totalNilai: 950000 },
        { id: '3', nama: 'Ahmad Dhani', totalPesanan: 8, totalNilai: 820000 },
        { id: '4', nama: 'Dewi Persik', totalPesanan: 7, totalNilai: 750000 },
        { id: '5', nama: 'Anang Hermansyah', totalPesanan: 6, totalNilai: 600000 }
      ].slice(0, limit);
    }
  } catch (error) {
    console.error('Error fetching top customers:', error);
    throw error;
  }
}; 