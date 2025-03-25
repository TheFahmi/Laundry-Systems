import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceCategoryModule } from '../service-category/service-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    ServiceCategoryModule
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService]
})
export class ServiceModule {} 