import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../customer/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';

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
  @ApiProperty({ description: 'The unique identifier of the order' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique order number in the format ORD-YYYYMMDD-XXXXX' })
  @Column({ name: 'order_number', default: 'ORD-00000000-00000', nullable: false })
  orderNumber: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty({ description: 'The customer who placed the order' })
  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'The status of the order' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW
  })
  status: OrderStatus;

  @ApiProperty({ description: 'The total amount of the order' })
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'The total weight of the order' })
  @Column({ name: 'total_weight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWeight: number;

  @Column({ name: 'notes', nullable: true })
  notes?: string;

  @Column({ name: 'special_requirements', nullable: true })
  specialRequirements?: string;

  @Column({ name: 'pickup_date', type: 'timestamp', nullable: true })
  pickupDate?: Date;

  @Column({ name: 'delivery_date', type: 'timestamp', nullable: true })
  deliveryDate?: Date;

  @ApiProperty({ description: 'Whether delivery is needed or customer will pick up' })
  @Column({ name: 'is_delivery_needed', default: false })
  isDeliveryNeeded: boolean;

  @ApiProperty({ description: 'The items in the order' })
  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];

  @ApiProperty({ description: 'The date when the order was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the order was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Generate a unique order number if one is not already set
   * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20240415-12345)
   */
  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber || this.orderNumber === 'ORD-00000000-00000') {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      
      this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
  }
} 