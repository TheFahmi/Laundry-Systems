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
exports.UpdateOrderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_order_dto_1 = require("./create-order.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("../entities/order.entity");
const swagger_1 = require("@nestjs/swagger");
class UpdateOrderDto extends (0, mapped_types_1.PartialType)(create_order_dto_1.CreateOrderDto) {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_entity_1.OrderStatus),
    (0, swagger_1.ApiProperty)({ enum: order_entity_1.OrderStatus, description: 'Order status', required: false }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ description: 'Notes for the order', required: false }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ description: 'Special requirements for the order', required: false }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "specialRequirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Total amount for the order', required: false }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ description: 'Total weight of the laundry', required: false }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "totalWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, swagger_1.ApiProperty)({ description: 'Pickup date', required: false }),
    __metadata("design:type", Date)
], UpdateOrderDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, swagger_1.ApiProperty)({ description: 'Delivery date', required: false }),
    __metadata("design:type", Date)
], UpdateOrderDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({ description: 'Whether delivery is needed or customer will pick up', required: false }),
    __metadata("design:type", Boolean)
], UpdateOrderDto.prototype, "isDeliveryNeeded", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({ description: 'Customer ID', required: false }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_order_dto_1.OrderItemDto),
    (0, swagger_1.ApiProperty)({ type: [create_order_dto_1.OrderItemDto], description: 'Order items', required: false }),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "items", void 0);
//# sourceMappingURL=update-order.dto.js.map