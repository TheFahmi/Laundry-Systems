import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The name of the service',
    example: 'Cuci Setrika',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A description of the service',
    example: 'Layanan cuci dan setrika pakaian',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The price of the service',
    example: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The unit of measurement for the service',
    example: 'kg',
    required: false,
    default: 'kg',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'The estimated time to complete the service in hours',
    example: 48,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedTime?: number;

  @ApiProperty({
    description: 'Whether the service is active or not',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 