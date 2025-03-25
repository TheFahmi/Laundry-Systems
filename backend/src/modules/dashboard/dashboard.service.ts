import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

// Interface untuk filter yang digunakan di berbagai fungsi
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  interval?: 'daily' | 'monthly';
}

// Interface untuk data ringkasan dashboard
export interface DashboardSummary {
  totalPendapatan: number;
  totalPesanan: number;
  pesananSelesai: number;
  pelangganAktif: number;
}

// Interface untuk data grafik pendapatan
export interface RevenueChartData {
  tanggal: string;
  pendapatan: number;
}

// Interface untuk data distribusi layanan
export interface ServiceDistribution {
  layanan: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk data distribusi status pesanan
export interface OrderStatusDistribution {
  status: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk data pelanggan teratas
export interface TopCustomer {
  id: string;
  nama: string;
  totalPesanan: number;
  totalNilai: number;
}

@Injectable()
export class DashboardService {
  
  // Contoh implementasi sederhana dengan data statis
  // Pada implementasi sesungguhnya, gunakan TypeORM Repository
  
  async getSummary(): Promise<DashboardSummary> {
    // Data contoh, seharusnya mengambil dari database
    return {
      totalPendapatan: 15000000,
      totalPesanan: 120,
      pesananSelesai: 98,
      pelangganAktif: 45
    };
  }

  async getRevenueChart(filters: DashboardFilters): Promise<RevenueChartData[]> {
    // Data contoh, seharusnya mengambil dari database
    return [
      { tanggal: '2023-01', pendapatan: 2500000 },
      { tanggal: '2023-02', pendapatan: 3100000 },
      { tanggal: '2023-03', pendapatan: 2800000 },
      { tanggal: '2023-04', pendapatan: 3300000 },
      { tanggal: '2023-05', pendapatan: 3200000 },
      { tanggal: '2023-06', pendapatan: 3800000 }
    ];
  }

  async getServiceDistribution(filters: DashboardFilters): Promise<ServiceDistribution[]> {
    // Data contoh, seharusnya mengambil dari database
    return [
      { layanan: 'Cuci Setrika', jumlah: 50, persentase: 41.7 },
      { layanan: 'Cuci Kering', jumlah: 30, persentase: 25 },
      { layanan: 'Setrika', jumlah: 25, persentase: 20.8 },
      { layanan: 'Premium', jumlah: 15, persentase: 12.5 }
    ];
  }

  async getOrderStatusDistribution(filters: DashboardFilters): Promise<OrderStatusDistribution[]> {
    // Data contoh, seharusnya mengambil dari database
    return [
      { status: 'Selesai', jumlah: 98, persentase: 81.7 },
      { status: 'Dalam Proses', jumlah: 15, persentase: 12.5 },
      { status: 'Menunggu', jumlah: 7, persentase: 5.8 }
    ];
  }

  async getTopCustomers(limit: number): Promise<TopCustomer[]> {
    // Data contoh, seharusnya mengambil dari database
    return [
      { id: '1', nama: 'Budi Santoso', totalPesanan: 12, totalNilai: 1200000 },
      { id: '2', nama: 'Siti Nurhaliza', totalPesanan: 10, totalNilai: 950000 },
      { id: '3', nama: 'Ahmad Dhani', totalPesanan: 8, totalNilai: 820000 },
      { id: '4', nama: 'Dewi Persik', totalPesanan: 7, totalNilai: 750000 },
      { id: '5', nama: 'Anang Hermansyah', totalPesanan: 6, totalNilai: 600000 }
    ].slice(0, limit);
  }
} 