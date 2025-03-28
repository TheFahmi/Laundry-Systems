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
  calculateSubtotal() {
    // Ensure price is never null
    if (this.price === null || this.price === undefined) {
      this.price = 0;
    }
    
    // Ensure quantity is never null
    if (this.quantity === null || this.quantity === undefined) {
      this.quantity = 1;
    }
    
    // Ensure serviceName is never null
    if (!this.serviceName) {
      this.serviceName = this.serviceId ? `Service ${this.serviceId}` : 'Unknown Service';
    }
    
    // For weight-based items, use the weight property with minimum 0.1 kg
    if (this.weightBased) {
      // Use weight property if available, otherwise revert to quantity with minimum 0.1
      const itemWeight = this.weight || Math.max(this.quantity, 0.1);
      // Ensure weight is stored with 2 decimal places
      this.weight = Number(itemWeight.toFixed(2));
      this.subtotal = this.price * this.weight;
      console.log(`Weight-based item: ${this.serviceName}, Weight: ${this.weight}kg, Price: ${this.price}, Subtotal: ${this.subtotal}`);
    } else {
      // For piece-based items, always use quantity with minimum 1
      this.quantity = Math.max(this.quantity, 1); // Ensure at least 1 piece
      this.subtotal = this.price * this.quantity;
      console.log(`Piece-based item: ${this.serviceName}, Quantity: ${this.quantity}, Price: ${this.price}, Subtotal: ${this.subtotal}`);
    }
    
    // Ensure subtotal is never null
    if (this.subtotal === null || this.subtotal === undefined) {
      this.subtotal = 0;
    }
    
    this.unitPrice = this.price;
    this.totalPrice = this.subtotal;
  }
} 