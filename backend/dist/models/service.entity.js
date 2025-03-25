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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.PriceModel = void 0;
const typeorm_1 = require("typeorm");
var PriceModel;
(function (PriceModel) {
    PriceModel["PER_KG"] = "per_kg";
    PriceModel["PER_PIECE"] = "per_piece";
    PriceModel["FLAT_RATE"] = "flat_rate";
})(PriceModel = exports.PriceModel || (exports.PriceModel = {}));
let Service = class Service {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Service.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Service.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PriceModel,
        default: PriceModel.PER_KG
    }),
    __metadata("design:type", String)
], Service.prototype, "priceModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Service.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Service.prototype, "processingTimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Object)
], Service.prototype, "additionalRequirements", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Service.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Service.prototype, "updatedAt", void 0);
Service = __decorate([
    (0, typeorm_1.Entity)('services')
], Service);
exports.Service = Service;
//# sourceMappingURL=service.entity.js.map