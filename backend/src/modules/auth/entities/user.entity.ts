import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({ 
    length: 20, 
    default: 'staff' 
  })
  role: string;

  @Column({ 
    name: 'is_active',
    default: true 
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 