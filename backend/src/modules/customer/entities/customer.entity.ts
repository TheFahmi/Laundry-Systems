import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../order/entities/order.entity';

@Entity('customers')
export class Customer {
  @ApiProperty({ description: 'The unique identifier of the customer' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the customer' })
  @Column({ type: 'varchar', length: 100, nullable: false, default: 'Unknown Customer' })
  name: string;

  @ApiProperty({ description: 'The phone number of the customer' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ description: 'The email address of the customer' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @ApiProperty({ description: 'The address of the customer' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ description: 'The orders placed by the customer' })
  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @ApiProperty({ description: 'The date when the customer was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the customer was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 