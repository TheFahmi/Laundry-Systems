import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
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

  @Column({ name: 'reference_number', type: 'varchar', length: 255, nullable: true, default: 'REF-00000000-00000' })
  referenceNumber: string;

  @Column({ name: 'payment_id', type: 'integer', nullable: true })
  paymentId: number;

  @Column({ name: 'order_id', type: 'varchar', nullable: true })
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

  /**
   * Generate a unique reference number if one is not already set
   * Format: REF-YYYYMMDD-XXXXX (e.g., REF-20240327-12345)
   */
  @BeforeInsert()
  generateReferenceNumber() {
    if (!this.referenceNumber || this.referenceNumber === 'REF-00000000-00000') {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      
      this.referenceNumber = `REF-${year}${month}${day}-${random}`;
    }
  }
} 