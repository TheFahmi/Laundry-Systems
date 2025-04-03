import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';
import { PaymentModule } from '../payment/payment.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    PaymentModule,
    OrderModule
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService]
})
export class CustomerModule {} 