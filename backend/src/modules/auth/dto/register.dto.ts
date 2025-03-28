import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'Username harus diisi' })
  @IsString({ message: 'Username harus berupa teks' })
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'Password harus diisi' })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'Email harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: 'Admin User',
    description: 'Nama lengkap pengguna',
    required: true,
  })
  @IsNotEmpty({ message: 'Nama harus diisi' })
  @IsString({ message: 'Nama harus berupa teks' })
  name: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role pengguna (admin, staff, manager)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Role harus berupa teks' })
  role?: string;
} 