import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    try {
      // Find user by username
      const user = await this.userRepository.findOne({ where: { username } });
      
      // If user not found, throw error
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Check if password is correct using bcrypt.compare
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        username: user.username,
        role: user.role 
      };
      
      // Return user and token (excluding password)
      const { password: _, ...userResponse } = user;
      
      return {
        user: userResponse,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Error during login:', error);
      throw new UnauthorizedException('Something went wrong during login');
    }
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password, name, role } = registerDto;

    try {
      // Validate required fields
      if (!username || !email || !password || !name) {
        throw new UnauthorizedException('All required fields must be provided: username, email, password, and name');
      }
      
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
        role: role || 'staff',
        isActive: true,
      });

      // Save user
      const savedUser = await this.userRepository.save(user);

      // Return user without password
      const { password: _, ...userResponse } = savedUser;
      
      return userResponse;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Error during registration:', error);
      throw new Error('Something went wrong during registration');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // Verify token
      const payload = this.jwtService.verify(token);
      
      // Check if user exists
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub }
      });
      
      return !!user;
    } catch (error) {
      return false;
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
} 