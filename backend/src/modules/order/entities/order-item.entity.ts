import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Order } from './order.entity';
import { Service } from '../../service/entities/service.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_name', nullable: true, type: 'varchar' })
  serviceName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateSubtotal() {
    // Ensure price is not null or undefined
    if (this.price === null || this.price === undefined) {
      this.price = 0;
    }
    
    // Ensure quantity is not null or undefined
    if (this.quantity === null || this.quantity === undefined) {
      this.quantity = 1;
    }
    
    // Calculate subtotal as price * quantity
    this.subtotal = this.price * this.quantity;
  }
} 