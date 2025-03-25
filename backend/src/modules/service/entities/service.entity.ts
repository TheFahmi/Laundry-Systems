import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ServiceCategory } from '../../service-category/entities/service-category.entity';
import { OrderItem } from '../../order/entities/order-item.entity';

@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => ServiceCategory, category => category.services)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @OneToMany(() => OrderItem, orderItem => orderItem.service)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 