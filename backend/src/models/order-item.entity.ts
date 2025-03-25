import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Service } from './service.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 