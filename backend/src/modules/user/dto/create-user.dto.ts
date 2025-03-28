import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'newuser',
    description: 'Username for the new account',
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the new account',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email for the new account',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is invalid' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STAFF,
    description: 'Role of the user (admin, staff, user)',
  })
  @IsEnum(UserRole, { message: 'Role must be one of: admin, staff, user' })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
} 