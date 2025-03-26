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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const uuid_1 = require("uuid");
let PaymentService = class PaymentService {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async create(createPaymentDto) {
        const payment = this.paymentRepository.create(Object.assign({ id: (0, uuid_1.v4)() }, createPaymentDto));
        return this.paymentRepository.save(payment);
    }
    async findAll(options) {
        try {
            const { page, limit, status, method } = options;
            const skip = (page - 1) * limit;
            const whereClause = {};
            if (status)
                whereClause.status = status;
            if (method)
                whereClause.method = method;
            const [data, total] = await this.paymentRepository.findAndCount({
                where: whereClause,
                relations: ['order', 'customer'],
                skip,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            const items = data.map(payment => {
                if (payment.customer) {
                    payment['customerName'] = payment.customer.name;
                }
                if (payment.order) {
                    payment['orderNumber'] = payment.order.orderNumber;
                }
                return payment;
            });
            return {
                items,
                total,
                page: options.page,
                limit: options.limit
            };
        }
        catch (error) {
            console.error(`Error in findAll method: ${error.message}`);
            return {
                items: [],
                total: 0,
                page: options.page,
                limit: options.limit
            };
        }
    }
    async findByOrderId(orderId) {
        try {
            const payments = await this.paymentRepository.find({
                where: { order: { id: orderId } },
                relations: ['customer'],
                order: { createdAt: 'DESC' }
            });
            return payments;
        }
        catch (error) {
            console.error(`Error finding payments for order ${orderId}: ${error.message}`);
            return [];
        }
    }
    async findOne(id) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id },
                relations: ['order', 'customer']
            });
            if (!payment) {
                throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
            }
            return payment;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error(`Error finding payment ${id}: ${error.message}`);
            throw new Error(`Unable to retrieve payment: ${error.message}`);
        }
    }
    async update(id, updatePaymentDto) {
        const payment = await this.findOne(id);
        this.paymentRepository.merge(payment, updatePaymentDto);
        return this.paymentRepository.save(payment);
    }
    async remove(id) {
        const payment = await this.findOne(id);
        await this.paymentRepository.remove(payment);
    }
};
PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map