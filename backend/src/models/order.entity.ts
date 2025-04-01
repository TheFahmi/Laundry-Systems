import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  WASHING = 'washing',
  DRYING = 'drying',
  FOLDING = 'folding',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWeight: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  specialRequirements: string;

  @Column({ type: 'timestamp', nullable: true })
  pickupDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveryDate: Date;

  @Column({ name: 'is_delivery_needed', default: false })
  isDeliveryNeeded: boolean;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 