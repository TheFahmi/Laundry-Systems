import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Customer } from '../../customer/customer.entity';

// Define enum types to match the database
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 255, nullable: true })
  referenceNumber: string;

  @Column({ name: 'payment_id', type: 'integer', nullable: true })
  paymentId: number;

  @Column({ name: 'order_id', type: 'varchar', length: 255, nullable: true })
  orderId: string;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'customer_id', type: 'varchar', length: 255, nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, customer => customer.payments)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 