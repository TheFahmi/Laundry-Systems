import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for the service' })
  id: string;

  @Column({ nullable: false })
  @ApiProperty({ description: 'The name of the service' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'A description of the service' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  @ApiProperty({ description: 'The price of the service' })
  price: number;

  @Column({ nullable: false, default: 'kg' })
  @ApiProperty({ description: 'The unit of measurement for the service (e.g., kg, pcs)' })
  unit: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The estimated time to complete the service in hours' })
  estimatedTime: number;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({ description: 'Whether the service is active or not' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The timestamp when the service was created' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The timestamp when the service was last updated' })
  updatedAt: Date;
} 