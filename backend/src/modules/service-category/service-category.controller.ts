import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ServiceCategoryService } from './service-category.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@ApiTags('service-categories')
@Controller('service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service category' })
  @ApiResponse({ status: 201, description: 'The service category has been successfully created.' })
  create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoryService.create(createServiceCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Return all service categories.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    page = page ? parseInt(page.toString()) : 1;
    limit = limit ? parseInt(limit.toString()) : 10;
    return this.serviceCategoryService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service category by id' })
  @ApiResponse({ status: 200, description: 'Return the service category with the matching id.' })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCategoryService.findOne(id);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get all services in a category' })
  @ApiResponse({ status: 200, description: 'Return all services in the category.' })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  findServices(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCategoryService.findServices(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service category' })
  @ApiResponse({ status: 200, description: 'The service category has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceCategoryDto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoryService.update(id, updateServiceCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service category' })
  @ApiResponse({ status: 200, description: 'The service category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Service category not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCategoryService.remove(id);
  }
} 