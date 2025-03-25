"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
let DashboardService = class DashboardService {
    async getSummary() {
        return {
            totalPendapatan: 15000000,
            totalPesanan: 120,
            pesananSelesai: 98,
            pelangganAktif: 45
        };
    }
    async getRevenueChart(filters) {
        return [
            { tanggal: '2023-01', pendapatan: 2500000 },
            { tanggal: '2023-02', pendapatan: 3100000 },
            { tanggal: '2023-03', pendapatan: 2800000 },
            { tanggal: '2023-04', pendapatan: 3300000 },
            { tanggal: '2023-05', pendapatan: 3200000 },
            { tanggal: '2023-06', pendapatan: 3800000 }
        ];
    }
    async getServiceDistribution(filters) {
        return [
            { layanan: 'Cuci Setrika', jumlah: 50, persentase: 41.7 },
            { layanan: 'Cuci Kering', jumlah: 30, persentase: 25 },
            { layanan: 'Setrika', jumlah: 25, persentase: 20.8 },
            { layanan: 'Premium', jumlah: 15, persentase: 12.5 }
        ];
    }
    async getOrderStatusDistribution(filters) {
        return [
            { status: 'Selesai', jumlah: 98, persentase: 81.7 },
            { status: 'Dalam Proses', jumlah: 15, persentase: 12.5 },
            { status: 'Menunggu', jumlah: 7, persentase: 5.8 }
        ];
    }
    async getTopCustomers(limit) {
        return [
            { id: '1', nama: 'Budi Santoso', totalPesanan: 12, totalNilai: 1200000 },
            { id: '2', nama: 'Siti Nurhaliza', totalPesanan: 10, totalNilai: 950000 },
            { id: '3', nama: 'Ahmad Dhani', totalPesanan: 8, totalNilai: 820000 },
            { id: '4', nama: 'Dewi Persik', totalPesanan: 7, totalNilai: 750000 },
            { id: '5', nama: 'Anang Hermansyah', totalPesanan: 6, totalNilai: 600000 }
        ].slice(0, limit);
    }
};
DashboardService = __decorate([
    (0, common_1.Injectable)()
], DashboardService);
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map