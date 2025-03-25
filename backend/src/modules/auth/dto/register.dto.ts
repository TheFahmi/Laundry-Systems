import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username untuk akun baru',
  })
  @IsNotEmpty({ message: 'Username harus diisi' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password untuk akun baru',
  })
  @IsNotEmpty({ message: 'Password harus diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email untuk akun baru',
  })
  @IsNotEmpty({ message: 'Email harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: 'Admin User',
    description: 'Nama lengkap pengguna',
  })
  @IsNotEmpty({ message: 'Nama harus diisi' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role pengguna (admin, staff, manager)',
  })
  @IsOptional()
  @IsString()
  role?: string;
} 