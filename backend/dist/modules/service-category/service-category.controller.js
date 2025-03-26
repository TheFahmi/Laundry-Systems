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
exports.ServiceCategoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_category_service_1 = require("./service-category.service");
const create_service_category_dto_1 = require("./dto/create-service-category.dto");
const update_service_category_dto_1 = require("./dto/update-service-category.dto");
let ServiceCategoryController = class ServiceCategoryController {
    constructor(serviceCategoryService) {
        this.serviceCategoryService = serviceCategoryService;
    }
    create(createServiceCategoryDto) {
        return this.serviceCategoryService.create(createServiceCategoryDto);
    }
    findAll(page, limit) {
        page = page ? parseInt(page.toString()) : 1;
        limit = limit ? parseInt(limit.toString()) : 10;
        return this.serviceCategoryService.findAll({ page, limit });
    }
    findOne(id) {
        return this.serviceCategoryService.findOne(id);
    }
    findServices(id) {
        return this.serviceCategoryService.findServices(id);
    }
    update(id, updateServiceCategoryDto) {
        return this.serviceCategoryService.update(id, updateServiceCategoryDto);
    }
    remove(id) {
        return this.serviceCategoryService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new service category' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The service category has been successfully created.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_category_dto_1.CreateServiceCategoryDto]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all service categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all service categories.' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a service category by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the service category with the matching id.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service category not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services in a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all services in the category.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service category not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "findServices", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The service category has been successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service category not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_category_dto_1.UpdateServiceCategoryDto]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a service category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The service category has been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Service category not found.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceCategoryController.prototype, "remove", null);
ServiceCategoryController = __decorate([
    (0, swagger_1.ApiTags)('service-categories'),
    (0, common_1.Controller)('service-categories'),
    __metadata("design:paramtypes", [service_category_service_1.ServiceCategoryService])
], ServiceCategoryController);
exports.ServiceCategoryController = ServiceCategoryController;
//# sourceMappingURL=service-category.controller.js.map