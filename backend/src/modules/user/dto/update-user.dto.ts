import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({
    example: 'updateduser',
    description: 'Username for the account',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password for the account',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @ApiProperty({
    example: 'updated@example.com',
    description: 'Email for the account',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email format is invalid' })
  email?: string;

  @ApiProperty({
    example: 'Updated Name',
    description: 'Full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Role of the user (admin, staff, user)',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: admin, staff, user' })
  role?: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
} 