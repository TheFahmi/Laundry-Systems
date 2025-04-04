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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("./entities/service.entity");
let ServiceService = class ServiceService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    async create(createServiceDto) {
        const service = this.serviceRepository.create(createServiceDto);
        return this.serviceRepository.save(service);
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10, search, category, isActive } = options;
        const skip = (page - 1) * limit;
        try {
            const queryBuilder = this.serviceRepository.createQueryBuilder('service');
            if (search) {
                queryBuilder.andWhere('(service.name ILIKE :search OR service.description ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
            if (category) {
                queryBuilder.andWhere('service.category = :category', { category });
            }
            if (isActive !== undefined) {
                queryBuilder.andWhere('service.isActive = :isActive', { isActive });
            }
            const total = await queryBuilder.getCount();
            const items = await queryBuilder
                .orderBy('service.name', 'ASC')
                .skip(skip)
                .take(limit)
                .getMany();
            return {
                items,
                total,
                page,
                limit
            };
        }
        catch (error) {
            console.error('Error in findAll:', error);
            return {
                items: [],
                total: 0,
                page,
                limit
            };
        }
    }
    async findOne(id) {
        try {
            const service = await this.serviceRepository.findOne({
                where: { id }
            });
            if (!service) {
                throw new common_1.NotFoundException(`Service with ID ${id} not found`);
            }
            return service;
        }
        catch (error) {
            console.error('Error in findOne:', error);
            throw error;
        }
    }
    async update(id, updateServiceDto) {
        const service = await this.findOne(id);
        Object.assign(service, updateServiceDto);
        return this.serviceRepository.save(service);
    }
    async remove(id) {
        const result = await this.serviceRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Service with ID ${id} not found`);
        }
    }
    async getCategories() {
        try {
            const result = await this.serviceRepository
                .createQueryBuilder('service')
                .select('DISTINCT service.category', 'category')
                .where('service.category IS NOT NULL')
                .andWhere('service.category != :empty', { empty: '' })
                .orderBy('service.category', 'ASC')
                .getRawMany();
            return result.map(item => item.category);
        }
        catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    }
    async save(serviceData) {
        try {
            if (serviceData.id) {
                const existingService = await this.serviceRepository.findOne({
                    where: { id: serviceData.id }
                });
                if (existingService) {
                    Object.assign(existingService, serviceData);
                    const result = await this.serviceRepository.save(existingService);
                    return result;
                }
            }
            const newService = this.serviceRepository.create(serviceData);
            const result = await this.serviceRepository.save(newService);
            return Array.isArray(result) ? result[0] : result;
        }
        catch (error) {
            console.error('Error saving service:', error);
            throw error;
        }
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServiceService);
//# sourceMappingURL=service.service.js.map