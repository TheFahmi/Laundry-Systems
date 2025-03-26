import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../service/entities/service.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for the service category' })
  id: string;

  @Column({ nullable: false })
  @ApiProperty({ description: 'The name of the service category' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'A description of the service category' })
  description: string;

  @OneToMany(() => Service, service => service.categoryId)
  @ApiProperty({ description: 'The services in this category', type: [Service] })
  services: Service[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The timestamp when the service category was created' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The timestamp when the service category was last updated' })
  updatedAt: Date;
} 