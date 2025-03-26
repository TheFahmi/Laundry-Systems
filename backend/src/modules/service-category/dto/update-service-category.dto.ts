import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateServiceCategoryDto {
  @ApiProperty({
    description: 'The name of the service category',
    example: 'Washing Services',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'A description of the service category',
    example: 'All washing related services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 