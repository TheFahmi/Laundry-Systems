"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary() {
        return this.dashboardService.getSummary();
    }
    async getRevenueChart(startDate, endDate, interval = 'monthly') {
        return this.dashboardService.getRevenueChart({ startDate, endDate, interval });
    }
    async getServiceDistribution(startDate, endDate) {
        return this.dashboardService.getServiceDistribution({ startDate, endDate });
    }
    async getOrderStatusDistribution(startDate, endDate) {
        return this.dashboardService.getOrderStatusDistribution({ startDate, endDate });
    }
    async getTopCustomers(limit = 5) {
        return this.dashboardService.getTopCustomers(limit);
    }
};
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan ringkasan dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil mendapatkan data ringkasan' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan data grafik pendapatan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil mendapatkan data grafik pendapatan' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('interval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('service-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan distribusi layanan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil mendapatkan data distribusi layanan' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getServiceDistribution", null);
__decorate([
    (0, common_1.Get)('order-status-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan distribusi status pesanan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil mendapatkan data distribusi status pesanan' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOrderStatusDistribution", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan data pelanggan teratas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil mendapatkan data pelanggan teratas' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopCustomers", null);
DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map