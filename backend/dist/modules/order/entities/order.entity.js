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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../../customer/customer.entity");
const payment_entity_1 = require("../../payment/entities/payment.entity");
const order_item_entity_1 = require("./order-item.entity");
let Order = class Order {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_number', type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_weight', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "totalWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_requirements', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "specialRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_date', type: 'timestamp' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Order.prototype, "pickupDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_date', type: 'timestamp' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, payment => payment.order),
    __metadata("design:type", Array)
], Order.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, orderItem => orderItem.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Order.prototype, "updatedAt", void 0);
Order = __decorate([
    (0, typeorm_1.Entity)({ name: 'orders' })
], Order);
exports.Order = Order;
//# sourceMappingURL=order.entity.js.map