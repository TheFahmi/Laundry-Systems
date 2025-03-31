import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { WorkOrderService } from './work-order.service';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderStep } from './entities/work-order-step.entity';
import { OrderStatus } from './entities/order.entity';
import { 
  CreateWorkOrderDto, 
  UpdateWorkOrderDto, 
  CreateWorkOrderStepDto, 
  UpdateWorkOrderStepDto,
  WorkOrderQueryDto 
} from './dto/work-order.dto';

@ApiTags('work-order')
@Controller('work-order')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  private readonly logger = new Logger(WorkOrderController.name);
  
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiResponse({ status: 201, description: 'The work order has been created successfully.' })
  create(@Body() createWorkOrderDto: CreateWorkOrderDto): Promise<WorkOrder> {
    return this.workOrderService.create(createWorkOrderDto);
  }

  @Post('from-job-queue/:id')
  @ApiOperation({ summary: 'Create a work order from a job queue item' })
  @ApiResponse({ status: 201, description: 'The work order has been created successfully from the job queue.' })
  createFromJobQueue(@Param('id') jobQueueId: string): Promise<{ data: WorkOrder[] }> {
    return this.workOrderService.createFromJobQueue(jobQueueId).then(data => ({ data }));
  }

  @Post('from-orders/:status')
  @ApiOperation({ summary: 'Create work orders from orders with the specified status' })
  @ApiResponse({ status: 201, description: 'The work orders have been created successfully from orders.' })
  createFromOrdersByStatus(@Param('status') status: OrderStatus): Promise<{ data: WorkOrder[] }> {
    return this.workOrderService.createFromOrdersByStatus(status).then(data => ({ data }));
  }

  @Get()
  @ApiOperation({ summary: 'Get all work orders with optional filtering' })
  @ApiResponse({ status: 200, description: 'Return the list of work orders.' })
  async findAll(@Query() query: WorkOrderQueryDto): Promise<{ data: WorkOrder[] }> {
    try {
      const data = await this.workOrderService.findAll(query);
      return { data };
    } catch (error) {
      this.logger.error(`Error fetching work orders: ${error.message}`, error.stack);
      
      // If the table doesn't exist yet, return an empty array
      if (error.message && error.message.includes('relation "work_orders" does not exist')) {
        this.logger.warn('Work orders table does not exist yet. Returning empty results.');
        return { data: [] };
      }
      
      throw new InternalServerErrorException('Failed to retrieve work orders');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work order by ID' })
  @ApiResponse({ status: 200, description: 'Return the work order.' })
  async findOne(@Param('id') id: string): Promise<WorkOrder> {
    try {
      return await this.workOrderService.findOne(id);
    } catch (error) {
      this.logger.error(`Error fetching work order ${id}: ${error.message}`, error.stack);
      
      // If the table doesn't exist yet, handle it gracefully
      if (error.message && error.message.includes('relation "work_orders" does not exist')) {
        this.logger.warn('Work orders table does not exist yet.');
        throw new InternalServerErrorException('Work orders functionality is not available yet');
      }
      
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a work order' })
  @ApiResponse({ status: 200, description: 'The work order has been updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto
  ): Promise<WorkOrder> {
    return this.workOrderService.update(id, updateWorkOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work order' })
  @ApiResponse({ status: 200, description: 'The work order has been deleted successfully.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.workOrderService.remove(id);
  }

  @Post('step')
  @ApiOperation({ summary: 'Create a new work order step' })
  @ApiResponse({ status: 201, description: 'The work order step has been created successfully.' })
  createStep(@Body() createWorkOrderStepDto: CreateWorkOrderStepDto): Promise<WorkOrderStep> {
    return this.workOrderService.createStep(createWorkOrderStepDto);
  }

  @Get('step/:id')
  @ApiOperation({ summary: 'Get a work order step by ID' })
  @ApiResponse({ status: 200, description: 'Return the work order step.' })
  findStep(@Param('id') id: string): Promise<WorkOrderStep> {
    return this.workOrderService.findStep(id);
  }

  @Patch('step/:id')
  @ApiOperation({ summary: 'Update a work order step' })
  @ApiResponse({ status: 200, description: 'The work order step has been updated successfully.' })
  updateStep(
    @Param('id') id: string,
    @Body() updateWorkOrderStepDto: UpdateWorkOrderStepDto
  ): Promise<WorkOrderStep> {
    return this.workOrderService.updateStep(id, updateWorkOrderStepDto);
  }

  @Delete('step/:id')
  @ApiOperation({ summary: 'Delete a work order step' })
  @ApiResponse({ status: 200, description: 'The work order step has been deleted successfully.' })
  removeStep(@Param('id') id: string): Promise<void> {
    return this.workOrderService.removeStep(id);
  }
} 