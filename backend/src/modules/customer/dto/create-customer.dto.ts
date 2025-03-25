import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Nama pelanggan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email pelanggan' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nomor telepon pelanggan', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Alamat pelanggan', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Catatan pelanggan', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 