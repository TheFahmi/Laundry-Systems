import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', generated: 'increment' })
  paymentId: number;

  @Column({ unique: true })
  referenceNumber: string;

  @ManyToOne(() => Customer, customer => customer.payments)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  notes: string;
  
  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
