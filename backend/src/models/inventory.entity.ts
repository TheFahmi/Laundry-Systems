import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerUnit: number;

  @Column({ default: false })
  needsRestock: boolean;

  @Column({ nullable: true })
  supplier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 