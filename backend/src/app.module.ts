import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './modules/customer/customer.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OrderModule } from './modules/order/order.module';
import { ServiceModule } from './modules/service/service.module';
import { ServiceCategoryModule } from './modules/service-category/service-category.module';
import { dataSourceOptions } from './database/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    CustomerModule,
    PaymentModule,
    AuthModule,
    DashboardModule,
    OrderModule,
    ServiceModule,
    ServiceCategoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 