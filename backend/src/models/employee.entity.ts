import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  LAUNDRY_STAFF = 'laundry_staff',
  DELIVERY_STAFF = 'delivery_staff',
  CUSTOMER_SERVICE = 'customer_service'
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.LAUNDRY_STAFF
  })
  role: EmployeeRole;

  @Column({ nullable: true })
  department: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  schedule: any;

  @Column({ type: 'json', nullable: true })
  performanceMetrics: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 