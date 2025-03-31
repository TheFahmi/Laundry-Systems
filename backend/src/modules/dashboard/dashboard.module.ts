import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Service } from '../service/entities/service.entity';
import { OrderItem } from '../order/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Payment,
      Customer, 
      Service,
      OrderItem
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {} 