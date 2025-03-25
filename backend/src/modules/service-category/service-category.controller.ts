import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ServiceCategoryService } from './service-category.service';
import { ServiceCategory } from './entities/service-category.entity';

@Controller('service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Get()
  findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ServiceCategory> {
    return this.serviceCategoryService.findOne(id);
  }

  @Post()
  create(@Body() serviceCategory: ServiceCategory): Promise<ServiceCategory> {
    return this.serviceCategoryService.create(serviceCategory);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() serviceCategory: ServiceCategory): Promise<ServiceCategory> {
    return this.serviceCategoryService.update(id, serviceCategory);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.serviceCategoryService.remove(id);
  }
} 