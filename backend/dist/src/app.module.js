"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const report_module_1 = require("./modules/report/report.module");
const order_module_1 = require("./modules/order/order.module");
const customer_module_1 = require("./modules/customer/customer.module");
const service_module_1 = require("./modules/service/service.module");
const user_module_1 = require("./modules/user/user.module");
const payment_module_1 = require("./modules/payment/payment.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const validation_middleware_1 = require("./middleware/validation.middleware");
const auth_module_2 = require("./guards/auth.module");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const calendar_module_1 = require("./modules/calendar/calendar.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(validation_middleware_1.ValidationMiddleware).forRoutes('auth/*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
                synchronize: false,
                extra: {
                    statement_timeout: 55000,
                    idleTimeoutMillis: 60000,
                    max_execution_time: 55000,
                    poolSize: 20,
                    connectionTimeoutMillis: 10000,
                },
                logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
                maxQueryExecutionTime: 5000,
            }),
            auth_module_2.GlobalAuthModule,
            auth_module_1.AuthModule,
            report_module_1.ReportModule,
            order_module_1.OrderModule,
            customer_module_1.CustomerModule,
            service_module_1.ServiceModule,
            user_module_1.UserModule,
            payment_module_1.PaymentModule,
            dashboard_module_1.DashboardModule,
            calendar_module_1.CalendarModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map