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
exports.CreateOrderDto = exports.PaymentInfoDto = exports.OrderItemDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("../entities/order.entity");
const payment_entity_1 = require("../../payment/entities/payment.entity");
class OrderItemDto {
}
exports.OrderItemDto = OrderItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({ description: 'Service ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], OrderItemDto.prototype, "serviceId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Quantity (for piece-based) or 1 for weight-based items', example: 2 }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Weight in kg (for weight-based items)', example: 0.5, required: false }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Price per unit', example: 15000, required: false }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ description: 'Service name', example: 'Regular Wash', required: false }),
    __metadata("design:type", String)
], OrderItemDto.prototype, "serviceName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({ description: 'Whether this item is weight-based pricing', example: true, required: false }),
    __metadata("design:type", Boolean)
], OrderItemDto.prototype, "weightBased", void 0);
class PaymentInfoDto {
}
exports.PaymentInfoDto = PaymentInfoDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Payment amount', example: 100000 }),
    __metadata("design:type", Number)
], PaymentInfoDto.prototype, "amount", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Change amount', example: 50000 }),
    __metadata("design:type", Number)
], PaymentInfoDto.prototype, "change", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    (0, swagger_1.ApiProperty)({ enum: payment_entity_1.PaymentMethod, description: 'Payment method', example: payment_entity_1.PaymentMethod.CASH }),
    __metadata("design:type", String)
], PaymentInfoDto.prototype, "method", void 0);
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({ description: 'Customer ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_entity_1.OrderStatus),
    (0, swagger_1.ApiProperty)({ enum: order_entity_1.OrderStatus, description: 'Order status', default: order_entity_1.OrderStatus.NEW, required: false }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ description: 'Notes for the order', required: false }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ description: 'Special requirements for the order', required: false }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "specialRequirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Total amount for the order', required: false }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Total amount for the order (alternative)', required: false }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Total weight of the laundry', required: false }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, swagger_1.ApiProperty)({ description: 'Pickup date', required: false }),
    __metadata("design:type", Date)
], CreateOrderDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, swagger_1.ApiProperty)({ description: 'Delivery date', required: false }),
    __metadata("design:type", Date)
], CreateOrderDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    (0, swagger_1.ApiProperty)({ type: [OrderItemDto], description: 'Order items' }),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PaymentInfoDto),
    (0, swagger_1.ApiProperty)({ type: PaymentInfoDto, description: 'Payment information', required: false }),
    __metadata("design:type", PaymentInfoDto)
], CreateOrderDto.prototype, "payment", void 0);
//# sourceMappingURL=create-order.dto.js.map