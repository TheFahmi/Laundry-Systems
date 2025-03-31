import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WorkOrderStepType } from './work-order.entity';

export enum WorkOrderStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

@Entity('work_order_steps')
export class WorkOrderStep {
  @ApiProperty({ description: 'The unique identifier of the work order step' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The associated work order ID' })
  @Column({ name: 'work_order_id' })
  workOrderId: string;

  @ApiProperty({ description: 'The associated work order' })
  @ManyToOne('WorkOrder', 'steps')
  @JoinColumn({ name: 'work_order_id' })
  workOrder: any;

  @ApiProperty({ description: 'The type of step in the work order process' })
  @Column({
    name: 'step_type',
    type: 'enum',
    enum: WorkOrderStepType
  })
  stepType: WorkOrderStepType;

  @ApiProperty({ description: 'The step number in sequence' })
  @Column({ name: 'sequence_number', type: 'int' })
  sequenceNumber: number;

  @ApiProperty({ description: 'The status of this step' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: WorkOrderStepStatus,
    default: WorkOrderStepStatus.PENDING
  })
  status: WorkOrderStepStatus;

  @ApiProperty({ description: 'Staff assigned to this step' })
  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ApiProperty({ description: 'Start time of this step' })
  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiProperty({ description: 'End time of this step' })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @ApiProperty({ description: 'Notes or comments for this step' })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'The date when this record was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when this record was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 