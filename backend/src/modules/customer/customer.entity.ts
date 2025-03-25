import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Payment, payment => payment.customer)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 