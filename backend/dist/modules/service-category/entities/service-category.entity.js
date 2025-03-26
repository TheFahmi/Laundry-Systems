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
exports.ServiceCategory = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const service_entity_1 = require("../../service/entities/service.entity");
let ServiceCategory = class ServiceCategory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, swagger_1.ApiProperty)({ description: 'The unique identifier for the service category' }),
    __metadata("design:type", String)
], ServiceCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    (0, swagger_1.ApiProperty)({ description: 'The name of the service category' }),
    __metadata("design:type", String)
], ServiceCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, swagger_1.ApiProperty)({ description: 'A description of the service category' }),
    __metadata("design:type", String)
], ServiceCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_entity_1.Service, service => service.categoryId),
    (0, swagger_1.ApiProperty)({ description: 'The services in this category', type: [service_entity_1.Service] }),
    __metadata("design:type", Array)
], ServiceCategory.prototype, "services", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, swagger_1.ApiProperty)({ description: 'The timestamp when the service category was created' }),
    __metadata("design:type", Date)
], ServiceCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, swagger_1.ApiProperty)({ description: 'The timestamp when the service category was last updated' }),
    __metadata("design:type", Date)
], ServiceCategory.prototype, "updatedAt", void 0);
ServiceCategory = __decorate([
    (0, typeorm_1.Entity)('service_categories')
], ServiceCategory);
exports.ServiceCategory = ServiceCategory;
//# sourceMappingURL=service-category.entity.js.map