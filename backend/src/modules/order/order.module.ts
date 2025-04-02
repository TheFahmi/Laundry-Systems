import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Service } from '../service/entities/service.entity';
import { AuthModule } from '../auth/auth.module';
import { DailyJobQueue } from './entities/daily-job-queue.entity';
import { JobQueueService } from './job-queue.service';
import { JobQueueController } from './job-queue.controller';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderStep } from './entities/work-order-step.entity';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';
import { PublicOrderController } from './public-order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, 
      OrderItem, 
      Payment, 
      Service, 
      DailyJobQueue, 
      WorkOrder, 
      WorkOrderStep
    ]),
    AuthModule
  ],
  controllers: [OrderController, JobQueueController, WorkOrderController, PublicOrderController],
  providers: [OrderService, JobQueueService, WorkOrderService],
  exports: [OrderService, JobQueueService, WorkOrderService]
})
export class OrderModule {} 