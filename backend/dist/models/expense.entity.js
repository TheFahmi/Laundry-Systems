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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = exports.ExpenseCategory = void 0;
const typeorm_1 = require("typeorm");
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["UTILITIES"] = "utilities";
    ExpenseCategory["SUPPLIES"] = "supplies";
    ExpenseCategory["RENT"] = "rent";
    ExpenseCategory["SALARY"] = "salary";
    ExpenseCategory["MAINTENANCE"] = "maintenance";
    ExpenseCategory["MARKETING"] = "marketing";
    ExpenseCategory["OTHER"] = "other";
})(ExpenseCategory = exports.ExpenseCategory || (exports.ExpenseCategory = {}));
let Expense = class Expense {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Expense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Expense.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseCategory,
        default: ExpenseCategory.OTHER
    }),
    __metadata("design:type", String)
], Expense.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Expense.prototype, "expenseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "receipt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "paidBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Expense.prototype, "approved", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Expense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Expense.prototype, "updatedAt", void 0);
Expense = __decorate([
    (0, typeorm_1.Entity)('expenses')
], Expense);
exports.Expense = Expense;
//# sourceMappingURL=expense.entity.js.map