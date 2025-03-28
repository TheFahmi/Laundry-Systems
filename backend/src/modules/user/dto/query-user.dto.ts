import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from './create-user.dto';

export class QueryUserDto {
  @ApiProperty({
    description: 'Search term for username, name, or email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Filter by user role',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: admin, staff, user' })
  role?: UserRole;

  @ApiProperty({
    example: 'true',
    description: 'Filter by active status',
    required: false,
  })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiProperty({
    example: '10',
    description: 'Number of records per page',
    default: '10',
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    example: '0',
    description: 'Page number (0-indexed)',
    default: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;
} 