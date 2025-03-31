import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Return all services' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    page = page ? parseInt(page.toString()) : 1;
    limit = limit ? parseInt(limit.toString()) : 10;
    
    // Convert string to boolean properly
    let isActiveBoolean: boolean | undefined = undefined;
    if (isActive !== undefined) {
      isActiveBoolean = isActive === 'true';
    }
    
    return this.serviceService.findAll({ 
      page, 
      limit, 
      search,
      category,
      isActive: isActiveBoolean
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Return all service categories' })
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.serviceService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiResponse({ status: 200, description: 'Return service by id' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new service' })
  @ApiResponse({ status: 201, description: 'Service successfully created' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
} 