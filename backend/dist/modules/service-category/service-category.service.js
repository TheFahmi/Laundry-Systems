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
exports.ServiceCategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_category_entity_1 = require("./entities/service-category.entity");
const service_entity_1 = require("../service/entities/service.entity");
let ServiceCategoryService = class ServiceCategoryService {
    constructor(serviceCategoryRepository, serviceRepository) {
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.serviceRepository = serviceRepository;
    }
    async create(createServiceCategoryDto) {
        const category = this.serviceCategoryRepository.create(createServiceCategoryDto);
        return this.serviceCategoryRepository.save(category);
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const [items, total] = await this.serviceCategoryRepository.findAndCount({
            skip,
            take: limit,
            order: { name: 'ASC' },
        });
        return {
            items,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
            relations: ['services']
        });
        if (!category) {
            throw new common_1.NotFoundException(`Service category with ID ${id} not found`);
        }
        return category;
    }
    async findServices(id) {
        const category = await this.findOne(id);
        return this.serviceRepository.find({
            where: { categoryId: id },
            order: { name: 'ASC' },
        });
    }
    async update(id, updateServiceCategoryDto) {
        const category = await this.findOne(id);
        Object.assign(category, updateServiceCategoryDto);
        return this.serviceCategoryRepository.save(category);
    }
    async remove(id) {
        const result = await this.serviceCategoryRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Service category with ID ${id} not found`);
        }
    }
};
ServiceCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_category_entity_1.ServiceCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ServiceCategoryService);
exports.ServiceCategoryService = ServiceCategoryService;
//# sourceMappingURL=service-category.service.js.map