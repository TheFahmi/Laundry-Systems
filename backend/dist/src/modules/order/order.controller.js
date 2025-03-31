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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const swagger_1 = require("@nestjs/swagger");
const order_entity_1 = require("./entities/order.entity");
const order_entity_2 = require("./entities/order.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    create(createOrderDto) {
        return this.orderService.create(createOrderDto);
    }
    async getCreateForm() {
        return { message: 'Order creation form data' };
    }
    findByOrderNumber(orderNumber) {
        return this.orderService.findByOrderNumber(orderNumber);
    }
    findAll(page, limit, status) {
        return this.orderService.findAll({ page, limit, status });
    }
    findOne(id) {
        return this.orderService.findOne(id);
    }
    update(id, updateOrderDto) {
        return this.orderService.update(id, updateOrderDto);
    }
    updateStatus(id, status) {
        return this.orderService.updateStatus(id, status);
    }
    remove(id) {
        return this.orderService.remove(id);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The order has been successfully created.', type: order_entity_1.Order }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('create-form'),
    (0, swagger_1.ApiOperation)({ summary: 'Get data for order creation form' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return data needed for order creation form' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getCreateForm", null);
__decorate([
    (0, common_1.Get)('by-number/:orderNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an order by order number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the order.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found.' }),
    (0, swagger_1.ApiParam)({ name: 'orderNumber', description: 'Order Number (e.g. ORD-000001)' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findByOrderNumber", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all orders.', type: [order_entity_1.Order] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: order_entity_2.OrderStatus, description: 'Filter by order status' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the order.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The order has been successfully updated.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The order status has been successfully updated.', type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The order has been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "remove", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map