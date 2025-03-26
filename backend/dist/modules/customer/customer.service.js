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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../../models/customer.entity");
let CustomerService = class CustomerService {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async generateCustomerId(customerId) {
        return `CUST-${customerId.toString().padStart(7, '0')}`;
    }
    async create(createCustomerDto) {
        const newCustomer = this.customerRepository.create(createCustomerDto);
        const savedCustomer = await this.customerRepository.save(newCustomer);
        const formattedId = await this.generateCustomerId(parseInt(savedCustomer.id));
        savedCustomer.id = formattedId;
        return this.customerRepository.save(savedCustomer);
    }
    async findAll(options) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [customers, total] = await this.customerRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['orders'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Pelanggan dengan ID "${id}" tidak ditemukan`);
        }
        return customer;
    }
    async update(id, updateCustomerDto) {
        const customer = await this.findOne(id);
        this.customerRepository.merge(customer, updateCustomerDto);
        return this.customerRepository.save(customer);
    }
    async remove(id) {
        const customer = await this.findOne(id);
        await this.customerRepository.remove(customer);
        return { message: 'Pelanggan berhasil dihapus' };
    }
};
CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerService);
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map