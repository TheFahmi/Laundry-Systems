"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_controller_1 = require("./order.controller");
const order_service_1 = require("./order.service");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const payment_entity_1 = require("../payment/entities/payment.entity");
const service_entity_1 = require("../service/entities/service.entity");
const auth_module_1 = require("../auth/auth.module");
const daily_job_queue_entity_1 = require("./entities/daily-job-queue.entity");
const job_queue_service_1 = require("./job-queue.service");
const job_queue_controller_1 = require("./job-queue.controller");
const work_order_entity_1 = require("./entities/work-order.entity");
const work_order_step_entity_1 = require("./entities/work-order-step.entity");
const work_order_service_1 = require("./work-order.service");
const work_order_controller_1 = require("./work-order.controller");
const public_order_controller_1 = require("./public-order.controller");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                order_item_entity_1.OrderItem,
                payment_entity_1.Payment,
                service_entity_1.Service,
                daily_job_queue_entity_1.DailyJobQueue,
                work_order_entity_1.WorkOrder,
                work_order_step_entity_1.WorkOrderStep
            ]),
            auth_module_1.AuthModule
        ],
        controllers: [order_controller_1.OrderController, job_queue_controller_1.JobQueueController, work_order_controller_1.WorkOrderController, public_order_controller_1.PublicOrderController],
        providers: [order_service_1.OrderService, job_queue_service_1.JobQueueService, work_order_service_1.WorkOrderService],
        exports: [order_service_1.OrderService, job_queue_service_1.JobQueueService, work_order_service_1.WorkOrderService]
    })
], OrderModule);
//# sourceMappingURL=order.module.js.map