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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const payment_entity_1 = require("../payment/entities/payment.entity");
const uuid_1 = require("uuid");
let OrderService = class OrderService {
    constructor(orderRepository, paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `ORD-${year}${month}${day}-${random}`;
    }
    async create(createOrderDto) {
        const customer = { id: createOrderDto.customerId };
        const { customerId } = createOrderDto, orderData = __rest(createOrderDto, ["customerId"]);
        const newOrder = this.orderRepository.create(Object.assign(Object.assign({}, orderData), { customer, orderNumber: await this.generateOrderNumber() }));
        return this.orderRepository.save(newOrder);
    }
    calculateTotalAmount(items) {
        if (!items || !Array.isArray(items))
            return 0;
        return items.reduce((total, item) => {
            const itemTotal = item.subtotal || (item.price * item.quantity) || 0;
            return total + Number(itemTotal);
        }, 0);
    }
    async findAll(options) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        try {
            const [data, total] = await this.orderRepository.findAndCount({
                relations: ['customer', 'items', 'items.service', 'payments'],
                skip,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            const items = data.map(order => {
                try {
                    const customerName = order.customer ? order.customer.name : 'Unknown Customer';
                    const orderWithCustomer = Object.assign(Object.assign({}, order), { customerName });
                    if (Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            try {
                                if (!item.serviceName) {
                                    item.serviceName = item.service ? item.service.name : `Service #${item.serviceId || 'Unknown'}`;
                                }
                                if (!item.price) {
                                    item.price = item.service ? item.service.price : 15000;
                                }
                                if (!item.subtotal) {
                                    item.subtotal = item.price * item.quantity;
                                }
                            }
                            catch (itemErr) {
                                console.error(`Error processing order item: ${itemErr.message}`);
                                item.serviceName = 'Unknown Service';
                                item.price = item.price || 15000;
                                item.subtotal = item.subtotal || (item.price * item.quantity);
                            }
                        });
                    }
                    if (!order.payments || order.payments.length === 0) {
                        order.payments = [{
                                id: `TEMP-${Date.now()}-${order.id}`,
                                referenceNumber: `REF-${order.orderNumber || order.id}`,
                                amount: order.totalAmount || 0,
                                method: payment_entity_1.PaymentMethod.CASH,
                                status: payment_entity_1.PaymentStatus.PENDING,
                                createdAt: new Date(),
                                order: order
                            }];
                    }
                    orderWithCustomer.totalAmount = this.calculateTotalAmount(order.items);
                    return orderWithCustomer;
                }
                catch (orderErr) {
                    console.error(`Error transforming order: ${orderErr.message}`);
                    return Object.assign(Object.assign({}, order), { customerName: 'Unknown Customer', items: [], payments: [{
                                id: `TEMP-${Date.now()}`,
                                referenceNumber: 'Default Payment',
                                amount: 0,
                                method: payment_entity_1.PaymentMethod.CASH,
                                status: payment_entity_1.PaymentStatus.PENDING,
                                createdAt: new Date()
                            }] });
                }
            });
            return {
                items,
                total,
                page,
                limit
            };
        }
        catch (error) {
            console.error(`Error in findAll method: ${error.message}`);
            return {
                items: [],
                total: 0,
                page,
                limit
            };
        }
    }
    async findOne(id) {
        var _a;
        try {
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['customer', 'items', 'items.service', 'payments']
            });
            if (!order) {
                throw new common_1.NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
            }
            const customerName = order.customer ? order.customer.name : 'Unknown Customer';
            order['customerName'] = customerName;
            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    try {
                        if (!item.serviceName) {
                            item.serviceName = item.service ? item.service.name : `Service #${item.serviceId || 'Unknown'}`;
                        }
                        if (!item.price) {
                            item.price = item.service ? item.service.price : 15000;
                        }
                        if (!item.subtotal) {
                            item.subtotal = item.price * item.quantity;
                        }
                    }
                    catch (itemErr) {
                        console.error(`Error processing order item: ${itemErr.message}`);
                        item.serviceName = 'Unknown Service';
                        item.price = item.price || 15000;
                        item.subtotal = item.subtotal || (item.price * item.quantity);
                    }
                });
            }
            order.totalAmount = this.calculateTotalAmount(order.items);
            if (!order.payments || order.payments.length === 0) {
                try {
                    const entityManager = this.orderRepository.manager;
                    const paymentId = `PAYMENT-${Date.now()}`;
                    const referenceNumber = `REF-${order.orderNumber || order.id}`;
                    const payment = new payment_entity_1.Payment();
                    payment.id = paymentId;
                    payment.referenceNumber = referenceNumber;
                    payment.amount = order.totalAmount || 0;
                    payment.method = payment_entity_1.PaymentMethod.CASH;
                    payment.status = payment_entity_1.PaymentStatus.PENDING;
                    payment.order = order;
                    payment.customerId = (_a = order.customer) === null || _a === void 0 ? void 0 : _a.id;
                    payment.createdAt = new Date();
                    payment.updatedAt = new Date();
                    await entityManager.save(payment);
                    order.payments = [payment];
                    console.log(`Created default payment for order ${order.id}`);
                }
                catch (paymentErr) {
                    console.error(`Error creating default payment: ${paymentErr.message}`);
                    order.payments = [{
                            id: `TEMP-${Date.now()}`,
                            referenceNumber: `REF-${order.orderNumber || order.id}`,
                            amount: order.totalAmount || 0,
                            method: payment_entity_1.PaymentMethod.CASH,
                            status: payment_entity_1.PaymentStatus.PENDING,
                            createdAt: new Date(),
                            order: order
                        }];
                }
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error(`Error in findOne method: ${error.message}`);
            throw new Error(`Unable to retrieve order: ${error.message}`);
        }
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${id} not found`);
        }
        const updatedOrder = this.orderRepository.merge(order, updateOrderDto);
        return this.orderRepository.save(updatedOrder);
    }
    async remove(id) {
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Order with id ${id} not found`);
        }
        return { affected: result.affected };
    }
    async createDefaultPayment(order) {
        try {
            const totalAmount = this.calculateTotalAmount(order.items);
            const paymentId = (0, uuid_1.v4)();
            const payment = this.paymentRepository.create({
                id: paymentId,
                orderId: order.id,
                customerId: order.customerId,
                amount: totalAmount,
                method: payment_entity_1.PaymentMethod.CASH,
                status: payment_entity_1.PaymentStatus.PENDING,
                transactionId: `TRX-${Date.now()}`
            });
            return await this.paymentRepository.save(payment);
        }
        catch (error) {
            console.error('Error creating default payment:', error);
            return null;
        }
    }
};
OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map