import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ReportModule } from './modules/report/report.module';
import { OrderModule } from './modules/order/order.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ServiceModule } from './modules/service/service.module';
import { UserModule } from './modules/user/user.module';
import { PaymentModule } from './modules/payment/payment.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { GlobalAuthModule } from './guards/auth.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CalendarModule } from './modules/calendar/calendar.module';

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
    GlobalAuthModule,
    AuthModule,
    ReportModule,
    OrderModule,
    CustomerModule,
    ServiceModule,
    UserModule,
    PaymentModule,
    DashboardModule,
    CalendarModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply validation middleware to auth routes
    consumer.apply(ValidationMiddleware).forRoutes('auth/*');
  }
} 