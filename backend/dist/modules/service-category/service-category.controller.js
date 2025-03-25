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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCategoryController = void 0;
const common_1 = require("@nestjs/common");
const service_category_service_1 = require("./service-category.service");
const service_category_entity_1 = require("./entities/service-category.entity");
let ServiceCategoryController = class ServiceCategoryController {
    constructor(serviceCategoryService) {
        this.serviceCategoryService = serviceCategoryService;
    }
    findAll() {
        return this.serviceCategoryService.findAll();
    }
    findOne(id) {
        return this.serviceCategoryService.findOne(id);
    }
    create(serviceCategory) {
        return this.serviceCategoryService.create(serviceCategory);
    }
    update(id, serviceCategory) {
        return this.serviceCategoryService.update(id, serviceCategory);
    }
    remove(id) {
        return this.serviceCategoryService.remove(id);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], ServiceCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], ServiceCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_category_entity_1.ServiceCategory]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ServiceCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_category_entity_1.ServiceCategory]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ServiceCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ServiceCategoryController.prototype, "remove", null);
ServiceCategoryController = __decorate([
    (0, common_1.Controller)('service-categories'),
    __metadata("design:paramtypes", [service_category_service_1.ServiceCategoryService])
], ServiceCategoryController);
exports.ServiceCategoryController = ServiceCategoryController;
//# sourceMappingURL=service-category.controller.js.map