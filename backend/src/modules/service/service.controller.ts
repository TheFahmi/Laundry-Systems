import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  @Post()
  create(@Body() service: Service): Promise<Service> {
    return this.serviceService.create(service);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() service: Service): Promise<Service> {
    return this.serviceService.update(id, service);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.serviceService.remove(id);
  }
} 