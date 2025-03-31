import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

@Entity('daily_job_queues')
export class DailyJobQueue {
  @ApiProperty({ description: 'The unique identifier of the job queue entry' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The order associated with this job queue entry' })
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ description: 'The date when this job is scheduled' })
  @Column({ name: 'scheduled_date', type: 'date' })
  scheduledDate: Date;

  @ApiProperty({ description: 'Position in the queue for the day' })
  @Column({ name: 'queue_position', type: 'int' })
  queuePosition: number;

  @ApiProperty({ description: 'Estimated completion time' })
  @Column({ name: 'estimated_completion_time', type: 'timestamp', nullable: true })
  estimatedCompletionTime: Date;

  @ApiProperty({ description: 'Actual completion time, filled when job is completed' })
  @Column({ name: 'actual_completion_time', type: 'timestamp', nullable: true })
  actualCompletionTime: Date;

  @ApiProperty({ description: 'Notes about the job queue entry' })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'The date when this record was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when this record was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 