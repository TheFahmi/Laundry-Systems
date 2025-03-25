import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PriceModel {
  PER_KG = 'per_kg',
  PER_PIECE = 'per_piece',
  FLAT_RATE = 'flat_rate'
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PriceModel,
    default: PriceModel.PER_KG
  })
  priceModel: PriceModel;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  processingTimeHours: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true, type: 'json' })
  additionalRequirements: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 