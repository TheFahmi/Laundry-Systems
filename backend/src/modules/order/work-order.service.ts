import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkOrder, WorkOrderStatus, WorkOrderStepType } from './entities/work-order.entity';
import { WorkOrderStep, WorkOrderStepStatus } from './entities/work-order-step.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { DailyJobQueue } from './entities/daily-job-queue.entity';
import { 
  CreateWorkOrderDto, 
  UpdateWorkOrderDto, 
  CreateWorkOrderStepDto, 
  UpdateWorkOrderStepDto,
  WorkOrderQueryDto
} from './dto/work-order.dto';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(WorkOrderStep)
    private workOrderStepRepository: Repository<WorkOrderStep>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(DailyJobQueue)
    private jobQueueRepository: Repository<DailyJobQueue>
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto): Promise<WorkOrder> {
    // Check if order exists
    const order = await this.orderRepository.findOne({ where: { id: createWorkOrderDto.orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${createWorkOrderDto.orderId} not found`);
    }

    // Check if job queue exists if provided
    if (createWorkOrderDto.jobQueueId) {
      const jobQueue = await this.jobQueueRepository.findOne({ 
        where: { id: createWorkOrderDto.jobQueueId } 
      });
      if (!jobQueue) {
        throw new NotFoundException(`Job Queue with ID ${createWorkOrderDto.jobQueueId} not found`);
      }
    }

    // Check if work order already exists for this order
    const existingWorkOrder = await this.workOrderRepository.findOne({
      where: { orderId: createWorkOrderDto.orderId }
    });

    if (existingWorkOrder) {
      throw new BadRequestException(`Work order already exists for order ID ${createWorkOrderDto.orderId}`);
    }

    // Create new work order
    const workOrder = this.workOrderRepository.create({
      orderId: createWorkOrderDto.orderId,
      jobQueueId: createWorkOrderDto.jobQueueId,
      assignedTo: createWorkOrderDto.assignedTo,
      priority: createWorkOrderDto.priority,
      instructions: createWorkOrderDto.instructions,
      notes: createWorkOrderDto.notes,
      status: WorkOrderStatus.PENDING,
      currentStep: WorkOrderStepType.SORTING
    });

    const savedWorkOrder = await this.workOrderRepository.save(workOrder);

    // Create initial steps for the work order
    const defaultSteps = [
      { type: WorkOrderStepType.SORTING, sequenceNumber: 1 },
      { type: WorkOrderStepType.WASHING, sequenceNumber: 2 },
      { type: WorkOrderStepType.DRYING, sequenceNumber: 3 },
      { type: WorkOrderStepType.FOLDING, sequenceNumber: 4 },
      { type: WorkOrderStepType.PACKAGING, sequenceNumber: 5 },
      { type: WorkOrderStepType.QUALITY_CHECK, sequenceNumber: 6 },
    ];

    // Create all steps 
    for (const step of defaultSteps) {
      const workOrderStep = this.workOrderStepRepository.create({
        workOrderId: savedWorkOrder.id,
        stepType: step.type,
        sequenceNumber: step.sequenceNumber,
        status: WorkOrderStepStatus.PENDING,
        assignedTo: createWorkOrderDto.assignedTo
      });

      await this.workOrderStepRepository.save(workOrderStep);
    }

    // Update order status to PROCESSING when work order is created
    await this.updateOrderStatus(order.id, OrderStatus.PROCESSING);

    return this.findOne(savedWorkOrder.id);
  }

  async findAll(query: WorkOrderQueryDto): Promise<WorkOrder[]> {
    const queryBuilder = this.workOrderRepository.createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.order', 'order')
      .leftJoinAndSelect('workOrder.jobQueue', 'jobQueue')
      .leftJoinAndSelect('workOrder.steps', 'steps')
      .orderBy('workOrder.createdAt', 'DESC');
    
    if (query.status) {
      queryBuilder.andWhere('workOrder.status = :status', { status: query.status });
    }
    
    if (query.orderId) {
      queryBuilder.andWhere('workOrder.orderId = :orderId', { orderId: query.orderId });
    }
    
    if (query.jobQueueId) {
      queryBuilder.andWhere('workOrder.jobQueueId = :jobQueueId', { jobQueueId: query.jobQueueId });
    }
    
    if (query.assignedTo) {
      queryBuilder.andWhere('workOrder.assignedTo = :assignedTo', { assignedTo: query.assignedTo });
    }
    
    if (query.date) {
      const startDate = new Date(query.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(query.date);
      endDate.setHours(23, 59, 59, 999);
      
      queryBuilder.andWhere('workOrder.createdAt BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    }
    
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['order', 'jobQueue', 'steps']
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async update(id: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const workOrder = await this.findOne(id);
    
    // Update fields
    Object.assign(workOrder, updateWorkOrderDto);
    
    // If status is changed to IN_PROGRESS and startTime is not set, set it now
    if (updateWorkOrderDto.status === WorkOrderStatus.IN_PROGRESS && !workOrder.startTime) {
      workOrder.startTime = new Date();
    }
    
    // If status is changed to COMPLETED and endTime is not set, set it now
    if (updateWorkOrderDto.status === WorkOrderStatus.COMPLETED && !workOrder.endTime) {
      workOrder.endTime = new Date();
    }
    
    return this.workOrderRepository.save(workOrder);
  }

  async remove(id: string): Promise<void> {
    const workOrder = await this.findOne(id);
    
    // First remove all steps
    await this.workOrderStepRepository.delete({ workOrderId: id });
    
    // Then remove the work order
    await this.workOrderRepository.remove(workOrder);
  }

  async createStep(createWorkOrderStepDto: CreateWorkOrderStepDto): Promise<WorkOrderStep> {
    // Check if work order exists
    const workOrder = await this.workOrderRepository.findOne({
      where: { id: createWorkOrderStepDto.workOrderId }
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${createWorkOrderStepDto.workOrderId} not found`);
    }

    // Create new step
    const workOrderStep = this.workOrderStepRepository.create(createWorkOrderStepDto);
    return this.workOrderStepRepository.save(workOrderStep);
  }

  async findStep(id: string): Promise<WorkOrderStep> {
    const step = await this.workOrderStepRepository.findOne({
      where: { id },
      relations: ['workOrder']
    });

    if (!step) {
      throw new NotFoundException(`Work order step with ID ${id} not found`);
    }

    return step;
  }

  async updateStep(id: string, updateWorkOrderStepDto: UpdateWorkOrderStepDto): Promise<WorkOrderStep> {
    const step = await this.findStep(id);
    
    // Update fields
    Object.assign(step, updateWorkOrderStepDto);
    
    // If status is changed to IN_PROGRESS and startTime is not set, set it now
    if (updateWorkOrderStepDto.status === WorkOrderStepStatus.IN_PROGRESS && !step.startTime) {
      step.startTime = new Date();
    }
    
    // If status is changed to COMPLETED and endTime is not set, set it now
    if (updateWorkOrderStepDto.status === WorkOrderStepStatus.COMPLETED && !step.endTime) {
      step.endTime = new Date();
      
      // If end time is set, calculate duration
      if (step.startTime && step.endTime) {
        const durationMs = step.endTime.getTime() - step.startTime.getTime();
        step.durationMinutes = Math.round(durationMs / 60000); // Convert ms to minutes
      }
      
      // Update work order current step to the next step, if there is one
      const workOrder = await this.workOrderRepository.findOne({
        where: { id: step.workOrderId },
        relations: ['steps']
      });
      
      if (workOrder) {
        // Find the next step by sequence number
        const nextStep = await this.workOrderStepRepository.findOne({
          where: {
            workOrderId: workOrder.id,
            sequenceNumber: step.sequenceNumber + 1
          }
        });
        
        if (nextStep) {
          workOrder.currentStep = nextStep.stepType;
          await this.workOrderRepository.save(workOrder);
        } else {
          // If there's no next step, check if all steps are completed
          const allSteps = await this.workOrderStepRepository.find({
            where: { workOrderId: workOrder.id }
          });
          
          const allCompleted = allSteps.every(s => 
            s.status === WorkOrderStepStatus.COMPLETED || 
            s.status === WorkOrderStepStatus.SKIPPED
          );
          
          if (allCompleted) {
            workOrder.status = WorkOrderStatus.COMPLETED;
            workOrder.endTime = new Date();
            await this.workOrderRepository.save(workOrder);
            
            // Update order status to READY when work order is completed
            await this.updateOrderStatus(workOrder.orderId, OrderStatus.READY);
          }
        }
      }
    }
    
    return this.workOrderStepRepository.save(step);
  }

  async removeStep(id: string): Promise<void> {
    const step = await this.findStep(id);
    await this.workOrderStepRepository.remove(step);
  }
  
  /**
   * Update the status of an order
   * @param orderId - The order ID
   * @param status - The new order status
   */
  private async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (order) {
      order.status = status;
      await this.orderRepository.save(order);
    }
  }

  /**
   * Create work orders from job queue items
   * @param jobQueueId - The job queue ID
   */
  async createFromJobQueue(jobQueueId: string): Promise<WorkOrder[]> {
    // Find the job queue
    const jobQueue = await this.jobQueueRepository.findOne({
      where: { id: jobQueueId },
      relations: ['order']
    });

    if (!jobQueue) {
      throw new NotFoundException(`Job Queue with ID ${jobQueueId} not found`);
    }

    // Check if work order already exists for this order
    const existingWorkOrder = await this.workOrderRepository.findOne({
      where: { 
        orderId: jobQueue.order.id,
      }
    });

    if (existingWorkOrder) {
      throw new BadRequestException(`Work order already exists for order ID ${jobQueue.order.id}`);
    }

    // Create work order
    const createDto: CreateWorkOrderDto = {
      orderId: jobQueue.order.id,
      jobQueueId: jobQueue.id,
      priority: 3 // Default priority level
    };

    return [await this.create(createDto)];
  }

  /**
   * Create work orders from orders by status
   * @param status - The order status to filter by
   */
  async createFromOrdersByStatus(status: OrderStatus): Promise<WorkOrder[]> {
    // Find orders with the specified status
    const orders = await this.orderRepository.find({
      where: { status }
    });

    if (!orders.length) {
      return [];
    }

    const createdWorkOrders: WorkOrder[] = [];

    // Create work orders for each order
    for (const order of orders) {
      try {
        // Check if work order already exists
        const existingWorkOrder = await this.workOrderRepository.findOne({
          where: { orderId: order.id }
        });

        if (!existingWorkOrder) {
          const createDto: CreateWorkOrderDto = {
            orderId: order.id
          };

          const workOrder = await this.create(createDto);
          createdWorkOrders.push(workOrder);
        }
      } catch (error) {
        // Log error and continue with next order
        console.error(`Failed to create work order for order ${order.id}:`, error.message);
      }
    }

    return createdWorkOrders;
  }
} 