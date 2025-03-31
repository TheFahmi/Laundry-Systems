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
      console.log(`[AuthService] Login request for user: ${username}`);
      
      // Find user by username
      const user = await this.userRepository.findOne({ where: { username } });
      
      // If user not found, throw error
      if (!user) {
        console.log(`[AuthService] Login failed: User not found: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if password is correct using bcrypt.compare
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log(`[AuthService] Login failed: Invalid password for user: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Log user details for debugging
      console.log('[AuthService] User found:', {
        id: user.id,
        username: user.username,
        role: user.role
      });

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        username: user.username,
        role: user.role 
      };
      
      // Log JWT payload for debugging
      console.log('[AuthService] JWT payload:', payload);
      
      // Generate the token
      const token = this.jwtService.sign(payload);
      console.log(`[AuthService] Token generated for ${username} (first 15 chars): ${token.substring(0, 15)}...`);
      
      // Return user and token (excluding password)
      const { password: _, ...userResponse } = user;
      
      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('[AuthService] Error during login:', error);
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

      // Generate a UUID for the user
      const userId = uuidv4();
      console.log('[REGISTER] Generated user ID:', userId);

      // Create new user
      const user = this.userRepository.create({
        id: userId,
        username,
        email,
        password: hashedPassword,
        name,
        role: role || 'staff',
        isActive: true,
      });

      // Save user
      const savedUser = await this.userRepository.save(user);
      console.log('[REGISTER] Saved user with ID:', savedUser.id);

      // Generate token
      const payload = { 
        sub: savedUser.id, 
        username: savedUser.username,
        role: savedUser.role 
      };

      console.log('[REGISTER] JWT payload:', payload);

      // Return user without password
      const { password: _, ...userResponse } = savedUser;
      
      return {
        user: userResponse,
        token: this.jwtService.sign(payload),
      };
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