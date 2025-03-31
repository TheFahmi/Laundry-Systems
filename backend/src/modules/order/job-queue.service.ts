import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { DailyJobQueue } from './entities/daily-job-queue.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateJobQueueDto, UpdateJobQueueDto } from './dto/job-queue.dto';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectRepository(DailyJobQueue)
    private jobQueueRepository: Repository<DailyJobQueue>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  async create(createJobQueueDto: CreateJobQueueDto): Promise<DailyJobQueue> {
    // Check if order exists
    const order = await this.orderRepository.findOne({ where: { id: createJobQueueDto.orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${createJobQueueDto.orderId} not found`);
    }

    // Check if this order already has a job queue entry for the given date
    const existingEntry = await this.jobQueueRepository.findOne({
      where: {
        orderId: createJobQueueDto.orderId,
        scheduledDate: new Date(createJobQueueDto.scheduledDate)
      }
    });

    if (existingEntry) {
      throw new BadRequestException(`This order already has a job queue entry for ${createJobQueueDto.scheduledDate}`);
    }

    // If queue position is not provided, auto-assign the next position
    let queuePosition = createJobQueueDto.queuePosition;
    if (!queuePosition) {
      const lastPosition = await this.getLastQueuePosition(createJobQueueDto.scheduledDate);
      queuePosition = lastPosition + 1;
    } else {
      // If position is provided, check if it's already taken and reorder as needed
      await this.handleQueuePositionConflict(createJobQueueDto.scheduledDate, queuePosition);
    }

    // Calculate estimated completion time if not provided
    let estimatedCompletionTime: Date | null = null;
    if (createJobQueueDto.estimatedCompletionTime) {
      estimatedCompletionTime = new Date(createJobQueueDto.estimatedCompletionTime);
    } else {
      estimatedCompletionTime = await this.calculateEstimatedCompletionTime(
        createJobQueueDto.scheduledDate,
        queuePosition,
        order
      );
    }

    // Create new job queue entry
    const jobQueue = this.jobQueueRepository.create({
      orderId: createJobQueueDto.orderId,
      scheduledDate: new Date(createJobQueueDto.scheduledDate),
      queuePosition,
      estimatedCompletionTime,
      notes: createJobQueueDto.notes
    });

    return this.jobQueueRepository.save(jobQueue);
  }

  async findAll(date: string): Promise<DailyJobQueue[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.jobQueueRepository.find({
      where: { scheduledDate: Between(startDate, endDate) },
      relations: ['order'],
      order: { queuePosition: 'ASC' }
    });
  }

  async findOne(id: string): Promise<DailyJobQueue> {
    const jobQueue = await this.jobQueueRepository.findOne({
      where: { id },
      relations: ['order']
    });

    if (!jobQueue) {
      throw new NotFoundException(`Job queue entry with ID ${id} not found`);
    }

    return jobQueue;
  }

  async update(id: string, updateJobQueueDto: UpdateJobQueueDto): Promise<DailyJobQueue> {
    const jobQueue = await this.findOne(id);
    
    // Handle queue position change
    if (updateJobQueueDto.queuePosition && updateJobQueueDto.queuePosition !== jobQueue.queuePosition) {
      await this.handleQueuePositionConflict(
        jobQueue.scheduledDate.toISOString().split('T')[0],
        updateJobQueueDto.queuePosition,
        id
      );
    }
    
    // Update fields
    if (updateJobQueueDto.queuePosition) {
      jobQueue.queuePosition = updateJobQueueDto.queuePosition;
    }
    
    if (updateJobQueueDto.estimatedCompletionTime) {
      jobQueue.estimatedCompletionTime = new Date(updateJobQueueDto.estimatedCompletionTime);
    }
    
    if (updateJobQueueDto.actualCompletionTime) {
      jobQueue.actualCompletionTime = new Date(updateJobQueueDto.actualCompletionTime);
    }
    
    if (updateJobQueueDto.notes) {
      jobQueue.notes = updateJobQueueDto.notes;
    }
    
    return this.jobQueueRepository.save(jobQueue);
  }

  async remove(id: string): Promise<void> {
    const jobQueue = await this.findOne(id);
    await this.jobQueueRepository.remove(jobQueue);
  }

  async getJobQueueForPrinting(date: string, status?: string): Promise<any[]> {
    const jobQueueItems = await this.findAll(date);
    
    // Parse status if it's a comma-separated string
    let statusArray: string[] = [];
    if (status) {
      statusArray = status.split(',').map(s => s.trim());
    }
    
    // Map job queue items to a format suitable for printing
    const printItems = await Promise.all(jobQueueItems.map(async (item) => {
      const order = await this.orderRepository.findOne({
        where: { id: item.orderId },
        relations: ['customer', 'items']
      });
      
      // Skip if status filter is provided and doesn't match
      if (status && statusArray.length > 0 && !statusArray.includes(order?.status)) {
        return null;
      }
      
      return {
        queuePosition: item.queuePosition,
        orderNumber: order?.orderNumber,
        customerName: order?.customer?.name,
        status: order?.status,
        totalItems: order?.items?.length || 0,
        totalWeight: order?.totalWeight,
        estimatedCompletionTime: item.estimatedCompletionTime
          ? this.formatTime(item.estimatedCompletionTime)
          : 'TBD',
        actualCompletionTime: item.actualCompletionTime
          ? this.formatTime(item.actualCompletionTime)
          : '',
        notes: item.notes
      };
    }));
    
    // Filter out null items (those that didn't match the status filter)
    return printItems.filter(item => item !== null).sort((a, b) => a.queuePosition - b.queuePosition);
  }

  // Helper methods
  private async getLastQueuePosition(date: string): Promise<number> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const result = await this.jobQueueRepository.findOne({
      where: { scheduledDate: Between(startDate, endDate) },
      order: { queuePosition: 'DESC' }
    });
    
    return result ? result.queuePosition : 0;
  }

  private async handleQueuePositionConflict(date: string, position: number, skipId?: string): Promise<void> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Check if position is already taken
    const conflictingEntry = await this.jobQueueRepository.findOne({
      where: {
        scheduledDate: Between(startDate, endDate),
        queuePosition: position,
        ...(skipId ? { id: skipId } : {})
      }
    });
    
    if (conflictingEntry && conflictingEntry.id !== skipId) {
      // Move all entries with position >= the requested position one step down
      await this.jobQueueRepository
        .createQueryBuilder()
        .update(DailyJobQueue)
        .set({ queuePosition: () => "queue_position + 1" })
        .where("scheduled_date BETWEEN :startDate AND :endDate", { startDate, endDate })
        .andWhere("queue_position >= :position", { position })
        .execute();
    }
  }

  private async calculateEstimatedCompletionTime(date: string, position: number, order: Order): Promise<Date> {
    // Basic calculation: Start from 8 AM, add 30 minutes for each position in queue
    const estimatedTime = new Date(date);
    estimatedTime.setHours(8, 0, 0, 0); // Start time: 8:00 AM
    
    // Base processing time: 30 minutes
    const baseProcessingMinutes = 30;
    
    // Additional time based on order complexity
    // We simplify by adding 5 minutes per order item and 2 minutes per kg
    let additionalMinutes = 0;
    
    // If order has items loaded, use them for calculation
    if (order.items && order.items.length > 0) {
      additionalMinutes += order.items.length * 5; // 5 minutes per item
    }
    
    if (order.totalWeight) {
      additionalMinutes += Math.ceil(order.totalWeight) * 2; // 2 minutes per kg
    }
    
    // For orders before this position, use average processing time
    // This is a simplified calculation; in a real scenario, we would calculate 
    // based on actual orders in the queue
    const totalMinutesToAdd = ((position - 1) * baseProcessingMinutes) + additionalMinutes;
    
    estimatedTime.setMinutes(estimatedTime.getMinutes() + totalMinutesToAdd);
    
    return estimatedTime;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 