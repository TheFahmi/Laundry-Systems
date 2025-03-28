import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ReportModule } from './modules/report/report.module';
import { OrderModule } from './modules/order/order.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ServiceModule } from './modules/service/service.module';
import { UserModule } from './modules/user/user.module';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { GlobalAuthModule } from './guards/auth.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    }),
    GlobalAuthModule,
    AuthModule,
    ReportModule,
    OrderModule,
    CustomerModule,
    ServiceModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CSRF middleware to all routes
    consumer.apply(CsrfMiddleware).forRoutes('*');
    
    // Apply validation middleware to auth routes
    consumer.apply(ValidationMiddleware).forRoutes('auth/*');
  }
} 