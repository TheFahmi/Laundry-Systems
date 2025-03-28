import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PriceModel {
  PER_KG = 'per_kg',
  PER_PIECE = 'per_piece',
  FLAT_RATE = 'flat_rate'
}

@Entity('services')
export class Service {
  @ApiProperty({ description: 'The unique identifier of the service' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the service' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'The description of the service' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'The price of the service' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ 
    description: 'The pricing model of the service (per_kg, per_piece, or flat_rate)',
    enum: PriceModel,
    default: PriceModel.PER_KG
  })
  @Column({ 
    name: 'pricemodel',
    type: 'varchar', 
    length: 50, 
    default: PriceModel.PER_KG
  })
  priceModel: string;

  @ApiProperty({ description: 'The processing time in hours for the service' })
  @Column('integer', { default: 24 })
  processingTimeHours: number;

  @ApiProperty({ description: 'Whether the service is active' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'The service category' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @ApiProperty({ description: 'The date when the service was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the service was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 