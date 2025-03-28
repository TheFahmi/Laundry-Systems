import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 100, nullable: false })
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