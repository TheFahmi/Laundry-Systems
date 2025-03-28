import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../auth/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, name, role, isActive } = createUserDto;

    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already in use');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      name,
      role,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Return user without password
    const { password: _, ...userResponse } = savedUser;
    
    return userResponse as any;
  }

  async findAll(query: QueryUserDto) {
    const { search, role, isActive, limit = '10', page = '0' } = query;
    
    const take = parseInt(limit, 10);
    const skip = parseInt(page, 10) * take;
    
    // Build where conditions
    const where: FindOptionsWhere<User> = {};
    
    if (search) {
      where.username = Like(`%${search}%`);
      // Add other search fields if needed
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    // Get paginated results and total count
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });
    
    return {
      data: users,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user as any;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, ...rest } = updateUserDto;

    // Check if the user exists
    const user = await this.userRepository.findOne({ 
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Check username uniqueness if it's being updated
    if (username && username !== user.username) {
      const usernameExists = await this.userRepository.findOne({
        where: { username },
      });
      
      if (usernameExists) {
        throw new ConflictException('Username already in use');
      }
    }
    
    // Check email uniqueness if it's being updated
    if (email && email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email },
      });
      
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }
    
    // Hash password if it's being updated
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // Update user
    await this.userRepository.update(id, {
      ...(username && { username }),
      ...(email && { email }),
      ...(password && { password: hashedPassword }),
      ...rest,
    });
    
    // Get the updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
    
    return updatedUser as any;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.userRepository.delete(id);
  }
} 