import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Order } from './order.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'service_id', nullable: false, default: '00000000-0000-0000-0000-000000000000' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_name', default: 'Unknown Service' })
  serviceName: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'weight' })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ nullable: true })
  notes: string;

  // Commented out until the column is added to the database
  // @Column({ name: 'weight_based', type: 'boolean', default: false })
  weightBased: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    if (this.weight && this.weight > 0) {
      this.totalPrice = this.weight * this.unitPrice;
    } else {
      this.totalPrice = this.quantity * this.unitPrice;
    }
  }
} 