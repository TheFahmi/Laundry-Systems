import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customer/customer.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 255, nullable: true })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
  
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'total_weight', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalWeight: number;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'special_requirements', type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ name: 'pickup_date', type: 'timestamp' })
  pickupDate: Date;

  @Column({ name: 'delivery_date', type: 'timestamp' })
  deliveryDate: Date;

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 