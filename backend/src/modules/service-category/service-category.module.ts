import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryController } from './service-category.controller';
import { ServiceCategoryService } from './service-category.service';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from '../service/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory, Service])],
  controllers: [ServiceCategoryController],
  providers: [ServiceCategoryService],
  exports: [ServiceCategoryService],
})
export class ServiceCategoryModule {} 