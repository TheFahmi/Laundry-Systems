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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const payment_entity_1 = require("../../../models/payment.entity");
class CreatePaymentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID Pesanan terkait' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Metode pembayaran',
        enum: payment_entity_1.PaymentMethod,
        default: payment_entity_1.PaymentMethod.CASH
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status pembayaran',
        enum: payment_entity_1.PaymentStatus,
        default: payment_entity_1.PaymentStatus.PENDING
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentStatus),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jumlah pembayaran' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID Transaksi (dari gateway pembayaran)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Catatan pembayaran', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nomor Referensi', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "referenceNumber", void 0);
exports.CreatePaymentDto = CreatePaymentDto;
//# sourceMappingURL=create-payment.dto.js.map