import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { DailyJobQueue } from './daily-job-queue.entity';
// Remove type import to avoid issues

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum WorkOrderStepType {
  SORTING = 'sorting',
  WASHING = 'washing',
  DRYING = 'drying',
  FOLDING = 'folding',
  IRONING = 'ironing',
  PACKAGING = 'packaging',
  QUALITY_CHECK = 'quality_check'
}

@Entity('work_orders')
export class WorkOrder {
  @ApiProperty({ description: 'The unique identifier of the work order' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The associated order ID' })
  @Column({ name: 'order_id' })
  orderId: string;

  @ApiProperty({ description: 'The associated order' })
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ description: 'The associated job queue ID (optional)' })
  @Column({ name: 'job_queue_id', nullable: true })
  jobQueueId: string;

  @ApiProperty({ description: 'The associated job queue' })
  @ManyToOne(() => DailyJobQueue, { nullable: true })
  @JoinColumn({ name: 'job_queue_id' })
  jobQueue: DailyJobQueue;

  @ApiProperty({ description: 'Work order number (WO-YYYYMMDD-XXXXX)' })
  @Column({ name: 'work_order_number', unique: true })
  workOrderNumber: string;

  @ApiProperty({ description: 'The status of the work order' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING
  })
  status: WorkOrderStatus;

  @ApiProperty({ description: 'The assigned staff member' })
  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ApiProperty({ description: 'Priority level (1-5, where 1 is highest)' })
  @Column({ name: 'priority', type: 'int', default: 3 })
  priority: number;

  @ApiProperty({ description: 'Start date and time of work' })
  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiProperty({ description: 'End date and time of work' })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @ApiProperty({ description: 'Special handling instructions' })
  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions: string;

  @ApiProperty({ description: 'Current processing step' })
  @Column({
    name: 'current_step',
    type: 'enum',
    enum: WorkOrderStepType,
    default: WorkOrderStepType.SORTING,
    nullable: true
  })
  currentStep: WorkOrderStepType;

  @ApiProperty({ description: 'Notes or comments' })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'The date when this record was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when this record was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // OneToMany relationship with WorkOrderSteps - using a string reference to avoid circular dependency
  @OneToMany('WorkOrderStep', 'workOrder', { cascade: true })
  steps: any[];
  
  /**
   * Generate a unique work order number if one is not already set
   * Format: WO-YYYYMMDD-XXXXX (e.g., WO-20240415-12345)
   */
  @BeforeInsert()
  generateWorkOrderNumber() {
    if (!this.workOrderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      
      this.workOrderNumber = `WO-${year}${month}${day}-${random}`;
    }
  }
} 