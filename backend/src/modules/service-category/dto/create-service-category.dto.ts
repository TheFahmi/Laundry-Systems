import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'The name of the service category',
    example: 'Washing Services',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A description of the service category',
    example: 'All washing related services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 