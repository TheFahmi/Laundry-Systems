import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
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