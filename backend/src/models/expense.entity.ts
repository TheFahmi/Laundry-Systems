import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpenseCategory {
  UTILITIES = 'utilities',
  SUPPLIES = 'supplies',
  RENT = 'rent',
  SALARY = 'salary',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  OTHER = 'other'
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER
  })
  category: ExpenseCategory;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({ nullable: true })
  receipt: string;

  @Column({ nullable: true })
  paidBy: string;

  @Column({ default: true })
  approved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 