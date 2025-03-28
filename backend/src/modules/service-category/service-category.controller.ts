import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceCategoryService } from './service-category.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from '../service/entities/service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('service-categories')
@ApiBearerAuth()
@Controller('service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service category' })
  @ApiResponse({ status: 201, description: 'The service category has been successfully created.', type: ServiceCategory })
  @UseGuards(JwtAuthGuard)
  create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoryService.create(createServiceCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Return all service categories.', type: [ServiceCategory] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @UseGuards(JwtAuthGuard)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.serviceCategoryService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service category by ID' })
  @ApiResponse({ status: 200, description: 'Return the service category.', type: ServiceCategory })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCategoryService.findOne(id);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get all services for a category' })
  @ApiResponse({ status: 200, description: 'Return all services for the category.', type: [Service] })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @UseGuards(JwtAuthGuard)
  findServices(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCategoryService.findServices(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service category' })
  @ApiResponse({ status: 200, description: 'The service category has been successfully updated.', type: ServiceCategory })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceCategoryDto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoryService.update(id, updateServiceCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service category' })
  @ApiResponse({ status: 200, description: 'The service category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  @ApiParam({ name: 'id', description: 'Service category ID' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCategoryService.remove(id);
  }
} 