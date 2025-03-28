"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dotenv = require("dotenv");
const global_exception_filter_1 = require("./filters/global-exception.filter");
const config_1 = require("@nestjs/config");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const transform_interceptor_1 = require("./interceptors/transform.interceptor");
const timeout_interceptor_1 = require("./interceptors/timeout.interceptor");
const cache_interceptor_1 = require("./interceptors/cache.interceptor");
const rate_limit_interceptor_1 = require("./interceptors/rate-limit.interceptor");
const compression_interceptor_1 = require("./interceptors/compression.interceptor");
const helmet_interceptor_1 = require("./interceptors/helmet.interceptor");
const cors_interceptor_1 = require("./interceptors/cors.interceptor");
const global_auth_guard_1 = require("./guards/global-auth.guard");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        disableErrorMessages: false,
        validationError: {
            target: false,
            value: false,
        },
        exceptionFactory: (errors) => {
            const messages = errors.map(error => {
                const constraints = Object.values(error.constraints || {});
                return constraints.length ? constraints.join(', ') : 'Validation failed';
            });
            return new common_1.ValidationPipe().createExceptionFactory()(errors);
        },
    }));
    app.enableCors({
        origin: configService.get('CORS_ORIGINS', '*').split(','),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalInterceptors(new timeout_interceptor_1.TimeoutInterceptor());
    app.useGlobalInterceptors(new cache_interceptor_1.CacheInterceptor());
    app.useGlobalInterceptors(new rate_limit_interceptor_1.RateLimitInterceptor());
    app.useGlobalInterceptors(new compression_interceptor_1.CompressionInterceptor());
    app.useGlobalInterceptors(new helmet_interceptor_1.HelmetInterceptor());
    app.useGlobalInterceptors(new cors_interceptor_1.CorsInterceptor());
    const globalAuthGuard = app.get(global_auth_guard_1.GlobalAuthGuard);
    app.useGlobalGuards(globalAuthGuard);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Laundry App API')
        .setDescription('API documentation for Laundry App')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    console.log('Database Connection Info:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`Username: ${process.env.DB_USERNAME}`);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map