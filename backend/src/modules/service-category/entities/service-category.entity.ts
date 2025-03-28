import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for the service category' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The name of the service category' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'A description of the service category' })
  description?: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'The timestamp when the service category was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The timestamp when the service category was last updated' })
  updatedAt: Date;
} 