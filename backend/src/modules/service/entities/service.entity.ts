import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategory } from '../../service-category/entities/service-category.entity';

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

  @Column({ name: 'unit', nullable: false, default: 'kg' })
  @ApiProperty({ description: 'The unit of measurement for the service (e.g., kg, pcs)' })
  unit: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The estimated time to complete the service in hours' })
  estimatedTime: number;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({ description: 'Whether the service is active or not' })
  isActive: boolean;

  @Column({ name: 'category_id', nullable: true })
  @ApiProperty({ description: 'The ID of the category this service belongs to' })
  categoryId: string;

  @ManyToOne(() => ServiceCategory, category => category.services)
  @JoinColumn({ name: 'category_id' })
  @ApiProperty({ description: 'The category this service belongs to' })
  category: ServiceCategory;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The timestamp when the service was created' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The timestamp when the service was last updated' })
  updatedAt: Date;
} 