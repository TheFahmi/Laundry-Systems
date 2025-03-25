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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async create(createPaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }
    async findAll(page, limit, status, method) {
        page = page ? parseInt(page.toString()) : 1;
        limit = limit ? parseInt(limit.toString()) : 10;
        return this.paymentService.findAll({ page, limit, status, method });
    }
    async findByOrderId(orderId) {
        return this.paymentService.findByOrderId(orderId);
    }
    async findOne(id) {
        return this.paymentService.findOne(id);
    }
    async update(id, updatePaymentDto) {
        return this.paymentService.update(id, updatePaymentDto);
    }
    async remove(id) {
        return this.paymentService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Buat pembayaran baru' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pembayaran berhasil dibuat' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan semua data pembayaran' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mengembalikan daftar semua pembayaran' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'method', required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan pembayaran berdasarkan ID pesanan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mengembalikan daftar pembayaran untuk pesanan yang diminta' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findByOrderId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan pembayaran berdasarkan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mengembalikan data pembayaran yang diminta' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pembayaran tidak ditemukan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Memperbarui data pembayaran' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pembayaran berhasil diperbarui' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pembayaran tidak ditemukan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Menghapus pembayaran' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pembayaran berhasil dihapus' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pembayaran tidak ditemukan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "remove", null);
PaymentController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map